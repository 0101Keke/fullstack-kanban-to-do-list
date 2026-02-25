import express from 'express';
import Task from '../models/Task.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/*Create Task*/
router.post('/', protect, async (req, res) => {
  try {
    const { title, topic, due, repeat } = req.body;

    if (!title || !due)
      return res.status(400).json({ message: 'Title and due date required' });

    const task = await Task.create({
      title,
      topic,
      due,
      repeat,
      user: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*Get User Tasks*/
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      deleted: false
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*Update Task*/
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    task.title = req.body.title ?? task.title;
    task.topic = req.body.topic ?? task.topic;
    task.status = req.body.status ?? task.status;
    task.due = req.body.due ?? task.due;
    task.repeat = req.body.repeat ?? task.repeat;
    task.subtasks = req.body.subtasks ?? task.subtasks;
    task.completedAt = req.body.completedAt !== undefined ? req.body.completedAt : task.completedAt;

    if (req.body.status && req.body.status !== "done") {
      task.completedAt = null;
    }

    if (req.body.status && req.body.status !== "done") {
      task.completedAt = null;
    }

    if (task.status === 'done') {
      task.completedAt = new Date();

      if (task.repeat !== 'none') {
        const newDate = new Date(task.due);
        if (task.repeat === 'daily') newDate.setDate(newDate.getDate() + 1);
        if (task.repeat === 'weekly') newDate.setDate(newDate.getDate() + 7);

        await Task.create({
          title: task.title,
          topic: task.topic,
          due: newDate,
          repeat: task.repeat,
          user: task.user
        });
      }
    }

    const updated = await task.save();
    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*Soft Delete*/
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.deleted = true;
    await task.save();

    res.json({ message: 'Moved to recycle bin' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*Get Recycle*/
router.get('/recycle/all', protect, async (req, res) => {
  const tasks = await Task.find({
    user: req.user._id,
    deleted: true
  });
  res.json(tasks);
});

/*Restore Task*/
router.put("/restore/:id", protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: "todo",
        deletedAt: null
      },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*Permanent Delete*/
router.delete("/permanent/:id", protect,  async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;