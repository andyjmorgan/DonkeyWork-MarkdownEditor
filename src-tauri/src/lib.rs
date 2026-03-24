use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{Emitter, Manager};
use tauri_plugin_dialog::DialogExt;

const MAX_RECENT_FILES: usize = 10;
const RECENT_FILES_FILENAME: &str = "recent_files.json";

/// Holds file paths received via macOS Apple Events before the frontend is ready
#[derive(Default)]
struct PendingFiles(Mutex<Vec<String>>);

#[derive(Debug, Serialize, Deserialize)]
pub struct FileResult {
    pub path: String,
    pub name: String,
    pub content: String,
}

/// Open a file dialog and read the selected file
#[tauri::command]
async fn open_file_dialog(app: tauri::AppHandle) -> Result<Option<FileResult>, String> {
    let file_path = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown", "txt"])
        .blocking_pick_file();

    match file_path {
        Some(path) => {
            let path_buf = path.into_path().map_err(|e| e.to_string())?;
            let content = fs::read_to_string(&path_buf).map_err(|e| e.to_string())?;
            let name = path_buf
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("untitled.md")
                .to_string();

            Ok(Some(FileResult {
                path: path_buf.to_string_lossy().to_string(),
                name,
                content,
            }))
        }
        None => Ok(None),
    }
}

/// Save file dialog for new files - returns the chosen path
#[tauri::command]
async fn save_file_dialog(
    app: tauri::AppHandle,
    default_name: String,
) -> Result<Option<String>, String> {
    let file_path = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md"])
        .set_file_name(&default_name)
        .blocking_save_file();

    match file_path {
        Some(path) => {
            let path_buf = path.into_path().map_err(|e| e.to_string())?;
            Ok(Some(path_buf.to_string_lossy().to_string()))
        }
        None => Ok(None),
    }
}

/// Read a file from disk
#[tauri::command]
async fn read_file(path: String) -> Result<FileResult, String> {
    let path_buf = PathBuf::from(&path);
    let content = fs::read_to_string(&path_buf).map_err(|e| e.to_string())?;
    let name = path_buf
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("untitled.md")
        .to_string();

    Ok(FileResult {
        path,
        name,
        content,
    })
}

/// Write content to a file on disk
#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| e.to_string())
}

/// Get the path to the recent files JSON
fn get_recent_files_path(app: &tauri::AppHandle) -> Option<PathBuf> {
    app.path().app_data_dir().ok().map(|dir| dir.join(RECENT_FILES_FILENAME))
}

/// Load recent file paths from disk
fn load_recent_paths(app: &tauri::AppHandle) -> Vec<String> {
    let Some(path) = get_recent_files_path(app) else {
        return Vec::new();
    };

    if !path.exists() {
        return Vec::new();
    }

    fs::read_to_string(&path)
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_default()
}

/// Save recent file paths to disk
fn save_recent_paths(app: &tauri::AppHandle, paths: &[String]) -> Result<(), String> {
    let Some(file_path) = get_recent_files_path(app) else {
        return Err("Could not get app data directory".to_string());
    };

    // Ensure directory exists
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let json = serde_json::to_string_pretty(paths).map_err(|e| e.to_string())?;
    fs::write(&file_path, json).map_err(|e| e.to_string())
}

/// Get recent files with metadata, filtering out non-existent files
#[tauri::command]
fn get_recent_files(app: tauri::AppHandle) -> Vec<FileResult> {
    let paths = load_recent_paths(&app);
    let mut valid_files = Vec::new();
    let mut valid_paths = Vec::new();

    for path_str in paths {
        let path = PathBuf::from(&path_str);
        if path.exists() && path.is_file() {
            if let Ok(content) = fs::read_to_string(&path) {
                let name = path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("untitled.md")
                    .to_string();
                valid_files.push(FileResult {
                    path: path_str.clone(),
                    name,
                    content,
                });
                valid_paths.push(path_str);
            }
        }
    }

    // Update stored paths to remove invalid ones
    if valid_paths.len() != load_recent_paths(&app).len() {
        let _ = save_recent_paths(&app, &valid_paths);
    }

    valid_files
}

/// Add a file path to recent files
#[tauri::command]
fn add_recent_file(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let mut paths = load_recent_paths(&app);

    // Remove if already exists (will be moved to top)
    paths.retain(|p| p != &path);

    // Add to front
    paths.insert(0, path);

    // Limit size
    paths.truncate(MAX_RECENT_FILES);

    save_recent_paths(&app, &paths)
}

/// Clear all recent files
#[tauri::command]
fn clear_recent_files(app: tauri::AppHandle) -> Result<(), String> {
    save_recent_paths(&app, &[])
}

/// Read a markdown file path into a FileResult if valid
fn read_markdown_path(path_str: &str) -> Option<FileResult> {
    let path = PathBuf::from(path_str);
    if path.exists() && path.is_file() {
        if let Some(ext) = path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if ext_str == "md" || ext_str == "markdown" {
                if let Ok(content) = fs::read_to_string(&path) {
                    let name = path
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("untitled.md")
                        .to_string();
                    return Some(FileResult {
                        path: path.to_string_lossy().to_string(),
                        name,
                        content,
                    });
                }
            }
        }
    }
    None
}

/// Get the file path if app was launched with a file argument or via macOS file association.
/// Checks buffered Apple Event paths first, then falls back to CLI args.
/// Drains the buffer so files are only returned once.
#[tauri::command]
fn get_opened_file(state: tauri::State<'_, PendingFiles>) -> Option<FileResult> {
    // Check buffered paths from Apple Events (macOS "Open With" / double-click)
    {
        let mut pending = state.0.lock().unwrap();
        if let Some(path_str) = pending.pop() {
            pending.clear(); // Only open one file at startup
            if let Some(result) = read_markdown_path(&path_str) {
                return Some(result);
            }
        }
    }

    // Fallback: check CLI arguments
    let args: Vec<String> = std::env::args().collect();
    for arg in args.iter().skip(1) {
        if let Some(result) = read_markdown_path(arg) {
            return Some(result);
        }
    }
    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(PendingFiles::default())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_file_dialog,
            save_file_dialog,
            read_file,
            write_file,
            get_opened_file,
            get_recent_files,
            add_recent_file,
            clear_recent_files
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app, _event| {
            #[cfg(target_os = "macos")]
            if let tauri::RunEvent::Opened { urls } = &_event {
                let paths: Vec<String> = urls
                    .iter()
                    .filter_map(|url| {
                        if url.scheme() == "file" {
                            url.to_file_path().ok().map(|p| p.to_string_lossy().to_string())
                        } else {
                            Some(url.to_string())
                        }
                    })
                    .collect();

                // Buffer paths for get_opened_file (handles startup race condition)
                if let Some(state) = _app.try_state::<PendingFiles>() {
                    let mut pending = state.0.lock().unwrap();
                    pending.extend(paths.clone());
                }

                // Also emit event for when the app is already running with files open
                let _ = _app.emit("open-file", &paths);
            }
        });
}
