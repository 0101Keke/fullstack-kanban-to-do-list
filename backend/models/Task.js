import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title required'],
    trim: true
  },

  topic: {
    type: String,
    default: 'General'
  },

  status: {
    type: String,
    enum: ['todo', 'progress', 'done'],
    default: 'todo'
  },

  due: {
    type: Date,
    required: true
  },

  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly'],
    default: 'none'
  },

  completed: Date,

  deleted: {
    type: Boolean,
    default: false
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, { timestamps: true });

export default mongoose.model('Task', TaskSchema);