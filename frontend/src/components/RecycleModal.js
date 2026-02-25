import React from "react";

export default function RecycleModal({
  recycleBin,
  setRecycleBin,
  setTasks,
  close
}) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2 style={{ padding: "1rem" }}>Recycle Bin</h2>

        <div className="recycle-list">
          {recycleBin.length === 0 && (
            <p className="empty">No deleted tasks.</p>
          )}

          {recycleBin.map(task => (
            <div key={task._id} className="recycle-item">
              <div className="recycle-title">
                {task.title}
              </div>

              <div className="recycle-buttons">
                <button
                  className="restore-btn"
                  onClick={() => {
                    setTasks(prev => [...prev, task]);
                    setRecycleBin(prev =>
                      prev.filter(t => t._id !== task._id)
                    );
                  }}
                >
                  Restore
                </button>

                <button
                  className="delete-permanent-btn"
                  onClick={() =>
                    setRecycleBin(prev =>
                      prev.filter(t => t._id !== task._id)
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="close-btn" onClick={close}>Close</button>
        </div>
      </div>
    </div>
  );
}