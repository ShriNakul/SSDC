// renderer.js
// Part 1/4

const { useState, useEffect } = React;

// -------------------------
// Helper Functions
// -------------------------

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";

  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
}

// -------------------------
// Deleted Section Component
// -------------------------

const DeletedSection = ({
  deletedList = [],
  onRestoreItem,
  onPermanentDeleteItem,
  onEmptyTrash,
  onClose,
}) => {
  return (
    <div
      className="appContainer"
      style={{
        backgroundColor: "#fff",
        zIndex: 100,
      }}
    >
      <header className="topRightInfo">
        <h2 className="title">Deleted Section</h2>

        <p className="subtitle">Items have a second chance</p>

        <button
          onClick={onClose}
          className="selectFolderBtn"
          style={{
            textDecoration: "none",
            fontSize: "2rem",
            marginTop: "1rem",
            color: "black",
          }}
        >
          ↖ Close
        </button>
      </header>

      <main
        className="workspace"
        style={{
          flexDirection: "column",
          padding: "100px 20px",
          gap: "1rem",
          maxWidth: "800px",
          alignItems: "flex-start",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              margin: 0,
            }}
          >
            Trash
          </h1>

          {deletedList.length > 0 && (
            <button
              onClick={onEmptyTrash}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Empty Trash
            </button>
          )}
        </div>

        {deletedList.length === 0 ? (
          <div
            style={{
              marginTop: "2rem",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            Trash is empty.
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              marginTop: "1rem",
            }}
          >
            {deletedList.map((item, index) => (
              <div
                key={item.trashName || index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px 20px",
                  background: "#f4f4f4",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  border: "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: "60%",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "#333",
                    }}
                  >
                    {item.originalName}
                  </span>

                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#777",
                      fontFamily: "monospace",
                    }}
                  >
                    {item.originalPath}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() => onRestoreItem(index)}
                    style={{
                      padding: "8px 15px",
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => onPermanentDeleteItem(index)}
                    style={{
                      padding: "8px 15px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Permanently Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
// renderer.js
// Part 2/4

// -------------------------
// File Cleanser Component
// -------------------------

const FileCleanser = ({
  isFirstTime,
  file,
  onSelectFolder,
  onKeep,
  onDelete,
  onViewTrash,
  trashCount,
  version,
}) => {
  const renderPreview = () => {
    if (!file) {
      return <div style={{ color: "#fff" }}>All files reviewed!</div>;
    }

    switch (file.typeHint) {
      case "image":
        return (
          <img
            src={`file://${file.path}`}
            alt={file.name}
            className="mediaPreview"
          />
        );

      case "video":
        return (
          <video
            src={`file://${file.path}`}
            controls
            className="mediaPreview"
          />
        );

      case "audio":
        return (
          <div className="audioWrapper">
            <svg viewBox="0 0 24 24" className="audioIcon">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>

            <audio
              src={`file://${file.path}`}
              controls
              className="audioPlayer"
            />
          </div>
        );

      case "code":
        return (
          <pre className="codePreview">
            <code>{file.content || "Loading preview..."}</code>
          </pre>
        );

      default:
        return (
          <div className="genericFile">
            <svg viewBox="0 0 24 24" className="genericFileIcon">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="appContainer">
      <header className="topRightInfo">
        <h2 className="title">File cleanser</h2>

        <p className="subtitle">System Temp & Cache Wipe (coming soon)</p>

        <p className="subtitle">File manager (coming soon)</p>
      </header>

      <main className="workspace">
        <button
          className="actionBtn"
          onClick={onKeep}
          disabled={isFirstTime || !file}
        >
          <div className="shieldWrapper">
            <svg viewBox="0 0 24 24" className="iconShield">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>

            <span className="shieldText">Keep</span>
          </div>

          <svg viewBox="0 0 24 24" className="arrowLeft">
            <polygon points="15.41,16.59 10.83,12 15.41,7.41 14,6 8,12 14,18" />
          </svg>
        </button>

        <div className="previewCard">
          <div className="previewContent">
            {isFirstTime ? (
              <div className="emptyState">
                <button className="selectFolderBtn" onClick={onSelectFolder}>
                  Select Folder
                </button>
              </div>
            ) : (
              renderPreview()
            )}
          </div>

          <div className="fileName">
            {file ? file.name : isFirstTime ? "..." : "Done!"}
          </div>
        </div>

        <button
          className="actionBtn"
          onClick={onDelete}
          disabled={isFirstTime || !file}
        >
          <svg viewBox="0 0 24 24" className="arrowRight">
            <polygon points="8.59,16.59 13.17,12 8.59,7.41 10,6 16,12 10,18" />
          </svg>

          <svg viewBox="0 0 24 24" className="iconTrash">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </main>

      <button className="viewTrashBtn" onClick={onViewTrash}>
        View Trash ({trashCount})
      </button>

      <footer className="bottomRightVersion">V {version}</footer>
    </div>
  );
};
// renderer.js
// Part 3/4

// -------------------------
// Main App Controller
// -------------------------

const App = () => {
  const [view, setView] = useState("cleanser");

  const [isFirstTime, setIsFirstTime] = useState(true);

  const [fileQueue, setFileQueue] = useState([]);

  const [deletedList, setDeletedList] = useState([]);

  // -------------------------
  // Load Trash On Startup
  // -------------------------

  useEffect(() => {
    async function loadTrash() {
      const trash = await window.electronAPI.getTrash();

      setDeletedList(trash);
    }

    loadTrash();
  }, []);

  // -------------------------
  // Select Folder
  // -------------------------

  const selectFolder = async () => {
    const folder = await window.electronAPI.selectFolder();

    if (!folder) return;

    const files = await window.electronAPI.readDirectory(folder);

    const prepared = files.map((file) => ({
      ...file,

      content: null,
    }));

    setFileQueue(prepared);

    setIsFirstTime(false);
  };

  // -------------------------
  // Load Code Preview
  // -------------------------

  useEffect(() => {
    async function loadPreview() {
      const file = fileQueue[0];

      if (file && file.typeHint === "code" && file.content === null) {
        const content = await window.electronAPI.readTextFile(file.path);

        setFileQueue((prev) => {
          const copy = [...prev];

          if (copy[0]) {
            copy[0] = {
              ...copy[0],

              content,
            };
          }

          return copy;
        });
      }
    }

    loadPreview();
  }, [fileQueue]);

  // -------------------------
  // Keep File
  // -------------------------

  const handleKeep = () => {
    setFileQueue((prev) => prev.slice(1));
  };

  // -------------------------
  // Delete File
  // -------------------------

  const handleDelete = async () => {
    const file = fileQueue[0];

    if (!file) return;

    const result = await window.electronAPI.moveToTrash(file.path);

    setDeletedList((prev) => [...prev, result]);

    setFileQueue((prev) => prev.slice(1));
  };

  // -------------------------
  // Restore File
  // -------------------------

  const handleRestoreItem = async (index) => {
    const item = deletedList[index];

    await window.electronAPI.restoreFromTrash(item);

    const updated = await window.electronAPI.getTrash();

    setDeletedList(updated);
  };

  // -------------------------
  // Permanent Delete
  // -------------------------

  const handlePermanentDelete = async (index) => {
    const item = deletedList[index];

    await window.electronAPI.permanentlyDelete(item);

    const updated = await window.electronAPI.getTrash();

    setDeletedList(updated);
  };

  // -------------------------
  // Empty Trash
  // -------------------------

  const handleEmptyTrash = async () => {
    await window.electronAPI.emptyTrash();

    setDeletedList([]);
  };

  return (
    <>
      {view === "trash" ? (
        <DeletedSection
          deletedList={deletedList}
          onRestoreItem={handleRestoreItem}
          onPermanentDeleteItem={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
          onClose={() => setView("cleanser")}
        />
      ) : (
        <FileCleanser
          isFirstTime={isFirstTime}
          file={fileQueue.length ? fileQueue[0] : null}
          onSelectFolder={selectFolder}
          onKeep={handleKeep}
          onDelete={handleDelete}
          onViewTrash={() => setView("trash")}
          trashCount={deletedList.length}
          version="1.2"
        />
      )}
    </>
  );
};
// renderer.js
// Part 4/4

// -------------------------
// Start React App
// -------------------------

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
