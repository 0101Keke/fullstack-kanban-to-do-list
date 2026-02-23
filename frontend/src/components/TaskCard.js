import { useState } from "react";

const TaskCard = ({ task, deleteTask, updateTask, getPriority }) => {
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  return (
    <div
      className={`task ${
        task.status === "done" ? "green" : getPriority(task.due)
      }`}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("id", task._id)}
    >
      {editing ? (
        <>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            onClick={() => {
              updateTask(task._id, newTitle);
              setEditing(false);
            }}
          >
            Save
          </button>
        </>
      ) : (
        <>
          <strong>{task.title}</strong>
          <div>{task.topic}</div>
          <small>
            Due: {new Date(task.due).toLocaleString()}
          </small>

          <div className="task-actions">
            <button onClick={() => setEditing(true)}>
              Update
            </button>
            <button onClick={() => deleteTask(task._id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;