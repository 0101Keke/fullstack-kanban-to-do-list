import React, { useEffect, useState } from "react";
import Column from "../components/Column";
import RecycleModal from "../components/RecycleModal";
import "../styles/dashboard.css";
import API from "../services/api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);
  const [activeTopic, setActiveTopic] = useState("all");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showRecycle, setShowRecycle] = useState(false);

  const [form, setForm] = useState({
    title: "",
    topic: "",
    date: "",
    time: "",
    repeat: "none"
  });

  /*Load Tasks*/

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data } = await API.get("/tasks");
        setTasks(data);
      } catch (err) {
        console.error("Failed to load tasks:", err);
      }
    };

    loadTasks()
  }, []);

  /*Add Task*/

  const addTask = async () => {
    if (!form.title || !form.date || !form.time) return;

    const due = new Date(`${form.date}T${form.time}`).getTime();

    const newTask = {
      title: form.title.trim(),
      topic: form.topic || "General",
      due,
      repeat: form.repeat,
      status: "todo",
      created: Date.now(),
      completed: null,
      subtasks: []
    };

    try {
      const { data } = await API.post("/tasks", newTask);

      setTasks(prev => [...prev, data]);

      setForm({
        title: "",
        topic: "",
        date: "",
        time: "",
        repeat: "none"
      });
    } catch (err) {
      console.error("Add task failed:", err);
    }
  };

  /*Update Task*/

  const updateTask = async (id, updates) => {
    try {
      const { data } = await API.put(`/tasks/${id}`, updates);

      setTasks(prev =>
        prev.map(t => (t._id === id ? data : t))
      );
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  /*Delete*/

  const deleteTask = async (id) => {
    const task = tasks.find(t => t._id === id);

    setRecycleBin(prev => [...prev, task]);

    try {
      //Backend handles delted flag and recycle logic, we just remove from UI
      await API.delete(`/tasks/${id}`);

      // Remove from UI
      setTasks(prev => prev.filter(t => t._id !== id));

      //Reload recycle from backend instead
      loadRecycle();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const loadRecycle = async () => {
    try {
      const { data } = await API.get("/tasks/recycle/all");
      setRecycleBin(data);
    } catch (err) {
      console.error("Recycle load failed:", err);
    }
  };
  /*Filter*/

  const filteredTasks = tasks.filter(task => {
    if (activeTopic !== "all" && task.topic !== activeTopic)
      return false;

    if (showTodayOnly) {
      const today = new Date();
      const d = new Date(task.due);
      if (
        d.getDate() !== today.getDate() ||
        d.getMonth() !== today.getMonth() ||
        d.getFullYear() !== today.getFullYear()
      )
        return false;
    }
    return true;
  });

  const topics = [...new Set(tasks.map(t => t.topic))];

  return (
    <div>
      <header>
        <h1>Kanban To-Do List 📖</h1>

        <div className="controls">
          <select
            value={activeTopic}
            onChange={e => setActiveTopic(e.target.value)}
          >
            <option value="all">All Topics</option>
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            className={showTodayOnly ? "active" : ""}
            onClick={() => setShowTodayOnly(prev => !prev)}
          >
            Today
          </button>

          <button onClick={() => {loadRecycle(); setShowRecycle(true);}}>
            🗑️ Recycle Bin
          </button>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Logout
          </button>

        </div>
      </header>

      <section className="legend">
        <span className="red"> Urgent</span>
        <span className="orange"> Important</span>
        <span className="yellow"> Flexible</span>
        <span className="green"> Completed</span>
      </section>

      <section className="add-task">
        <input
          placeholder="Task title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <input
          placeholder="Topic (optional)"
          value={form.topic}
          onChange={e => setForm({ ...form, topic: e.target.value })}
        />

        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />

        <input
          type="time"
          value={form.time}
          onChange={e => setForm({ ...form, time: e.target.value })}
        />

        <select
          value={form.repeat}
          onChange={e => setForm({ ...form, repeat: e.target.value })}
        >
          <option value="none">No Repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>

        <button onClick={addTask}>Add Task</button>
      </section>

      <main className="board">
        <Column
          status="todo"
          tasks={filteredTasks}
          updateTask={updateTask}
          deleteTask={deleteTask}
        />

        <Column
          status="progress"
          tasks={filteredTasks}
          updateTask={updateTask}
          deleteTask={deleteTask}
        />

        <Column
          status="done"
          tasks={filteredTasks}
          updateTask={updateTask}
          deleteTask={deleteTask}
        />
      </main>

      {showRecycle && (
        <RecycleModal
          recycleBin={recycleBin}
          setRecycleBin={setRecycleBin}
          setTasks={setTasks}
          close={() => setShowRecycle(false)}
        />
      )}
    </div>
  );
}
