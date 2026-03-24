use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{Emitter, Manager};
use tauri_plugin_dialog::DialogExt;

const MAX_RECENT_FILES: usize = 10;
const RECENT_FILES_FILENAME: &str = "recent_files.json";

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

/// Get the file path if app was launched with a file argument
#[tauri::command]
fn get_opened_file() -> Option<FileResult> {
    let args: Vec<String> = std::env::args().collect();

    // Check if a file path was passed as argument (skip the first arg which is the executable)
    for arg in args.iter().skip(1) {
        let path = PathBuf::from(arg);
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
    }
    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
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
        .run(|app, event| {
            if let tauri::RunEvent::Opened { urls } = event {
                for url in urls {
                    // file:// URLs from macOS file associations
                    if let Ok(path) = url.to_file_path() {
                        if let Some(ext) = path.extension() {
                            let ext_str = ext.to_string_lossy().to_lowercase();
                            if ext_str == "md" || ext_str == "markdown" {
                                if let Ok(content) = fs::read_to_string(&path) {
                                    let name = path
                                        .file_name()
                                        .and_then(|n| n.to_str())
                                        .unwrap_or("untitled.md")
                                        .to_string();
                                    let file = FileResult {
                                        path: path.to_string_lossy().to_string(),
                                        name,
                                        content,
                                    };
                                    let _ = app.emit("open-file", &file);
                                }
                            }
                        }
                    }
                }
            }
        });
}
