import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true, enum: ['To Do', 'In Progress', 'Done'] },
  assignedUser: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);