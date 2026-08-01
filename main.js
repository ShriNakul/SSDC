// main.js
// Part 1/3

const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");

const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;

// -------------------------
// App Settings
// -------------------------

const APP_NAME = "File Cleanser";

let TRASH_PATH;

// -------------------------
// Setup App Storage
// -------------------------

function setupPaths() {
  TRASH_PATH = path.join(app.getPath("userData"), "FileCleanserTrash");

  if (!fs.existsSync(TRASH_PATH)) {
    fs.mkdirSync(TRASH_PATH, {
      recursive: true,
    });
  }
}

// -------------------------
// Create Window
// -------------------------

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: false,
    },

    autoHideMenuBar: true,
  });

  win.loadFile("index.html");

  // Enable for debugging:
  // win.webContents.openDevTools();
}

// -------------------------
// App Lifecycle
// -------------------------

app.whenReady().then(() => {
  setupPaths();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// -------------------------
// File Helpers
// -------------------------

function safeFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, "_");
}

function generateTrashName(originalName) {
  return Date.now() + "_" + safeFileName(originalName);
}

function getTrashFilePath(fileName) {
  return path.join(TRASH_PATH, fileName);
}

function getTrashMetaPath(fileName) {
  return path.join(TRASH_PATH, `${fileName}.json`);
}
// main.js
// Part 2/3

// -------------------------
// Folder Selection
// -------------------------

ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

// -------------------------
// File Type Detection
// -------------------------

function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const imageTypes = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"];

  const videoTypes = [".mp4", ".mov", ".avi", ".mkv", ".webm"];

  const audioTypes = [".mp3", ".wav", ".ogg", ".flac", ".m4a"];

  const codeTypes = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".html",
    ".css",
    ".json",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".cs",
    ".php",
    ".md",
    ".xml",
    ".yaml",
    ".yml",
  ];

  if (imageTypes.includes(ext)) {
    return "image";
  }

  if (videoTypes.includes(ext)) {
    return "video";
  }

  if (audioTypes.includes(ext)) {
    return "audio";
  }

  if (codeTypes.includes(ext)) {
    return "code";
  }

  return "unknown";
}

// -------------------------
// Recursive Folder Scanner
// -------------------------

async function scanDirectory(directory) {
  let results = [];

  const entries = await fsp.readdir(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const children = await scanDirectory(fullPath);

      results.push(...children);
    } else {
      const stats = await fsp.stat(fullPath);

      results.push({
        name: entry.name,

        path: fullPath,

        size: stats.size,

        modified: stats.mtime.toISOString(),

        typeHint: getFileType(fullPath),
      });
    }
  }

  return results;
}

// -------------------------
// Move File To Custom Trash
// -------------------------

async function moveFileToTrash(filePath) {
  const originalName = path.basename(filePath);

  const trashName = generateTrashName(originalName);

  const destination = getTrashFilePath(trashName);

  const metadata = {
    originalName,

    originalPath: filePath,

    trashName,

    deletedAt: new Date().toISOString(),
  };

  // Copy first so moving
  // across drives works
  await fsp.copyFile(filePath, destination);

  // Remove original
  await fsp.rm(filePath, {
    force: true,
  });

  await fsp.writeFile(
    getTrashMetaPath(trashName),
    JSON.stringify(metadata, null, 2),
  );

  return metadata;
}

// -------------------------
// Restore File
// -------------------------

async function restoreFile(trashName) {
  const metaPath = getTrashMetaPath(trashName);

  if (!fs.existsSync(metaPath)) {
    throw new Error("Trash information missing");
  }

  const metadata = JSON.parse(await fsp.readFile(metaPath, "utf8"));

  let restorePath = metadata.originalPath;

  const trashFile = getTrashFilePath(trashName);

  if (fs.existsSync(restorePath)) {
    const folder = path.dirname(restorePath);

    const ext = path.extname(restorePath);

    const base = path.basename(restorePath, ext);

    let count = 1;

    while (fs.existsSync(restorePath)) {
      restorePath = path.join(folder, `${base}_restored_${count}${ext}`);

      count++;
    }
  }

  await fsp.copyFile(trashFile, restorePath);

  await fsp.rm(trashFile, {
    force: true,
  });

  await fsp.rm(metaPath, {
    force: true,
  });

  return {
    restoredPath: restorePath,
  };
}

// -------------------------
// Permanently Delete
// -------------------------

async function permanentlyDelete(trashName) {
  await fsp.rm(getTrashFilePath(trashName), {
    force: true,
  });

  await fsp.rm(getTrashMetaPath(trashName), {
    force: true,
  });

  return true;
}

// -------------------------
// Empty Trash
// -------------------------

async function emptyTrash() {
  const files = await fsp.readdir(TRASH_PATH);

  for (const file of files) {
    await fsp.rm(path.join(TRASH_PATH, file), {
      recursive: true,
      force: true,
    });
  }

  return true;
}
// main.js
// Part 3/3

// -------------------------
// Get Trash Contents
// -------------------------

async function getTrashContents() {
  const files = await fsp.readdir(TRASH_PATH);

  const items = [];

  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }

    const data = await fsp.readFile(path.join(TRASH_PATH, file), "utf8");

    items.push(JSON.parse(data));
  }

  return items;
}

// -------------------------
// Read Text File Preview
// -------------------------

async function readTextFile(filePath) {
  const maxBytes = 10240;

  const handle = await fsp.open(filePath, "r");

  const buffer = Buffer.alloc(maxBytes);

  const result = await handle.read(buffer, 0, maxBytes, 0);

  await handle.close();

  return result.buffer.slice(0, result.bytesRead).toString("utf8");
}

// -------------------------
// File Utilities
// -------------------------

async function fileExists(filePath) {
  try {
    await fsp.access(filePath);

    return true;
  } catch {
    return false;
  }
}

async function getFileStats(filePath) {
  const stats = await fsp.stat(filePath);

  return {
    size: stats.size,

    modified: stats.mtime.toISOString(),
  };
}

// -------------------------
// Open / Reveal Files
// -------------------------

async function openFile(filePath) {
  return await shell.openPath(filePath);
}

async function revealFile(filePath) {
  shell.showItemInFolder(filePath);

  return true;
}

// -------------------------
// IPC CONNECTIONS
// -------------------------

ipcMain.handle("read-directory", async (event, folderPath) => {
  return await scanDirectory(folderPath);
});

ipcMain.handle("move-to-trash", async (event, filePath) => {
  return await moveFileToTrash(filePath);
});

ipcMain.handle("restore-from-trash", async (event, item) => {
  return await restoreFile(item.trashName);
});

ipcMain.handle("permanently-delete", async (event, item) => {
  return await permanentlyDelete(item.trashName);
});

ipcMain.handle("empty-trash", async () => {
  return await emptyTrash();
});

ipcMain.handle("get-trash", async () => {
  return await getTrashContents();
});

ipcMain.handle("read-text-file", async (event, filePath) => {
  return await readTextFile(filePath);
});

ipcMain.handle("file-exists", async (event, filePath) => {
  return await fileExists(filePath);
});

ipcMain.handle("file-stat", async (event, filePath) => {
  return await getFileStats(filePath);
});

ipcMain.handle("open-file", async (event, filePath) => {
  return await openFile(filePath);
});

ipcMain.handle("reveal-file", async (event, filePath) => {
  return await revealFile(filePath);
});

ipcMain.handle("app-version", () => {
  return app.getVersion();
});
