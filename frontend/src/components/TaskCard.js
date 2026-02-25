import React, { useEffect, useState } from "react";

export default function TaskCard({ task, updateTask, deleteTask }) {

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getPriority = () => {
    if (task.status === "done") return "green";

    const dueTime = new Date(task.due).getTime();
    const diff = (dueTime - now) / 3600000;

    if (diff <= 24) return "red";
    if (diff <= 72) return "orange";
    return "yellow";
  };

  const countdown = () => {
    const dueTime = new Date(task.due).getTime();
    const diff = dueTime - now;

    if (!dueTime || isNaN(dueTime)) return "";
    if (diff <= 0) return "Expired";

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${h}h ${m}m ${s}s`;
  };

  /*const toggleSubtask = (index) => {
    const updated = [...task.subtasks];
    updated[index].done = !updated[index].done;

    const allDone =
      updated.length &&
      updated.every(st => st.done);

    updateTask(task._id, {
      subtasks: updated,
      status: allDone ? "done" : task.status,
      completed: allDone ? Date.now() : task.completed
    });
  };*/

  return (
    <div
      className={`task-card ${getPriority()}`}
      draggable
      onDragStart={e => e.dataTransfer.setData("id", task._id)}
    >
      <div className="task-header">
        <div className="task-actions">
          <button
            className="edit-btn"
            onClick={() => {
              const title = prompt("Edit task title:", task.title);
              if (title)
                updateTask(task._id, { title });
            }}
          >
            ✏️
          </button>

          <button
            className="delete-btn"
            onClick={() => deleteTask(task._id)}
          >
            ✕
          </button>
        </div>
      </div>

      <strong>{task.title}</strong>
      <small>{task.topic}</small>
      <small>
        Due: {new Date(task.due).toLocaleString()}
      </small>

      {task.status !== "done" && (
        <small className="countdown">⌛ {countdown()}</small>
      )}

      {task.completedAt && (
        <small>
          ✅ Completed: {" "}
          {new Date(task.completedAt).toLocaleString()}
        </small>
      )}

      {task.status === "progress" && (
        <div className="subtasks">
          {(task.subtasks || []).map((s, index) => (
            <label key={index}>
              <input
                type="checkbox"
                checked={s.done}
                onChange={() => {
                  const updatedSubtasks = task.subtasks.map((st, i) => 
                    i === index ? { ...st, done: !st.done } : st
                  );
                  const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.done);
                  updateTask(task._id, {
                    subtasks: updatedSubtasks,
                    status: allDone ? "done" : "progress",
                    completedAt: allDone ? new Date() : null
                  });
                }}
              />
              {s.text}
            </label>
          ))}
          <input
            placeholder="Add subtask..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                updateTask(task._id, {
                  subtasks: [...(task.subtasks || []), { text: e.target.value.trim(), done: false }]
                });
                e.target.value = "";
              }
            }}
          />
        </div>
      )}
    </div>
  );
}