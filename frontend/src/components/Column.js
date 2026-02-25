import React from "react";
import TaskCard from "./TaskCard";

export default function Column({ status, tasks, updateTask, deleteTask }) {
  return (
    <div
      className="column"
      data-status={status}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        const id = e.dataTransfer.getData("id");

        if (status === "done") {
          updateTask(id, { status: "done" });
        } else {
          updateTask(id, {
            status,
            completedAt: null
          });
        }
      }}
    >
      <h2>
        {status === "todo"
          ? "To Do"
          : status === "progress"
          ? "In Progress"
          : "Completed"}
      </h2>

      {tasks
        .filter(t => t.status === status)
        .map(task => (
          <TaskCard
            key={task._id}
            task={task}
            updateTask={updateTask}
            deleteTask={deleteTask}
          />
        ))}
    </div>
  );
}