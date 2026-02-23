import React, { useEffect, useState } from 'react';
import API from '../services/api';
import "../styles/dashboard.css";
import TaskCard from '../components/TaskCard';

const Dashboard = () => {

  const [tasks, setTasks] = useState([]);
  const [recycle, setRecycle] = useState([]);
  const [showRecycle, setShowRecycle] = useState(false);

  const [activeTopic, setActiveTopic] = useState('all');
  const [todayOnly, setTodayOnly] = useState(false);

  const [form, setForm] = useState({
    title:'',
    topic:'',
    date:'',
    time:'',
    repeat:'none'
  });

  const fetchTasks = async () => {
    const { data } = await API.get('/tasks');
    setTasks(data);
  };

  const fetchRecycle = async () => {
    const { data } = await API.get('/tasks/recycle/all');
    setRecycle(data);
  };

  useEffect(()=>{ fetchTasks(); }, []);

  const addTask = async () => {
    if (!form.title || !form.date || !form.time)
      return alert('All fields required');

    const due = new Date(`${form.date}T${form.time}`);

    await API.post('/tasks', {
      title: form.title,
      topic: form.topic || 'General',
      due,
      repeat: form.repeat
    });

    setForm({title:'',topic:'',date:'',time:'',repeat:'none'});
    fetchTasks();
  };

  const updateStatus = async (id, status) => {
    await API.put(`/tasks/${id}`, { status });
    fetchTasks();
  };

  const deleteTask = async id => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const updateTask = async (id, updatedTitle) => {
    try {
      const res = await API.put(`/tasks/${id}`, {
        title: updatedTitle
      });

      setTasks(tasks.map(t => 
        t._id === id ? res.data : t
      ));
    } catch (err) {
      console.error(err);
    }
  };
  const restoreTask = async id => {
    await API.put(`/tasks/${id}`, { deleted:false });
    fetchTasks();
    fetchRecycle();
  };

  const getPriority = (due) => {
    const diff = (new Date(due) - new Date()) / 3600000;
    if (diff <= 24) return 'red';
    if (diff <= 72) return 'orange';
    return 'yellow';
  };

  const filteredTasks = tasks.filter(task=>{
    if (activeTopic !== 'all' && task.topic !== activeTopic)
      return false;

    if (todayOnly) {
      const t = new Date(task.due);
      const today = new Date();
      if (
        t.getFullYear() !== today.getFullYear() ||
        t.getMonth() !== today.getMonth() ||
        t.getDate() !== today.getDate()
      ) return false;
    }

    return true;
  });

  const topics = ['all', ...new Set(tasks.map(t=>t.topic))];

  return (
    <div>

      <div className="header">
        <h2>Kanban To-Do List</h2>
        <div className="controls">
          <select onChange={e=>setActiveTopic(e.target.value)}>
            {topics.map(t=>(
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button onClick={()=>setTodayOnly(!todayOnly)}>
            Today
          </button>

          <button onClick={()=>{
            fetchRecycle();
            setShowRecycle(true);
          }}>
            Recycle Bin
          </button>

          <button onClick={()=>{
            localStorage.removeItem('token');
            window.location.reload();
          }}>
            Logout
          </button>
        </div>
      </div>

      <div className="add-task">
        <input placeholder="Task title"
          value={form.title}
          onChange={e=>setForm({...form,title:e.target.value})}
        />
        <input placeholder="Topic"
          value={form.topic}
          onChange={e=>setForm({...form,topic:e.target.value})}
        />
        <input type="date"
          value={form.date}
          onChange={e=>setForm({...form,date:e.target.value})}
        />
        <input type="time"
          value={form.time}
          onChange={e=>setForm({...form,time:e.target.value})}
        />
        <select
          value={form.repeat}
          onChange={e=>setForm({...form,repeat:e.target.value})}
        >
          <option value="none">No Repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="board">
        {['todo','progress','done'].map(status=>(
          <div
            key={status}
            className="column"
            onDragOver={e=>e.preventDefault()}
            onDrop={async e=>{
              const id=e.dataTransfer.getData('id');
              await updateStatus(id,status);
            }}
          >
            <h3>{status.toUpperCase()}</h3>

            {filteredTasks
              .filter(t => t.status === status)
              .map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  getPriority={getPriority}
                />
              ))
            }
          </div>
        ))}
      </div>

      {showRecycle && (
        <div className="modal">
          <div className="modal-content">
            <h3>Recycle Bin</h3>
            {recycle.length === 0 && <p>No deleted tasks</p>}
            {recycle.map(task=>(
              <div key={task._id}>
                {task.title}
                <button onClick={()=>restoreTask(task._id)}>
                  Restore
                </button>
              </div>
            ))}
            <button onClick={()=>setShowRecycle(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;