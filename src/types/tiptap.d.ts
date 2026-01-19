import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      /**
       * Insert a Mermaid diagram
       */
      setMermaid: (attributes?: { code?: string }) => ReturnType
    }
  }
}
