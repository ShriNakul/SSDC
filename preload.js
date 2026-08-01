// preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // -------------------------
  // Folder
  // -------------------------

  selectFolder: () => ipcRenderer.invoke("select-folder"),

  readDirectory: (folderPath) =>
    ipcRenderer.invoke("read-directory", folderPath),

  // -------------------------
  // Trash Operations
  // -------------------------

  moveToTrash: (filePath) => ipcRenderer.invoke("move-to-trash", filePath),

  getTrash: () => ipcRenderer.invoke("get-trash"),

  restoreFromTrash: (item) => ipcRenderer.invoke("restore-from-trash", item),

  permanentlyDelete: (item) => ipcRenderer.invoke("permanently-delete", item),

  emptyTrash: () => ipcRenderer.invoke("empty-trash"),

  // -------------------------
  // File Preview
  // -------------------------

  readTextFile: (filePath) => ipcRenderer.invoke("read-text-file", filePath),

  fileExists: (filePath) => ipcRenderer.invoke("file-exists", filePath),

  fileStats: (filePath) => ipcRenderer.invoke("file-stat", filePath),

  // -------------------------
  // File Actions
  // -------------------------

  openFile: (filePath) => ipcRenderer.invoke("open-file", filePath),

  revealFile: (filePath) => ipcRenderer.invoke("reveal-file", filePath),

  // -------------------------
  // App Info
  // -------------------------

  getVersion: () => ipcRenderer.invoke("app-version"),
});
