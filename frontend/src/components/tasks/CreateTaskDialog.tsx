import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { tasksAPI } from '../../services/api';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onTaskCreated: () => void;
}

const TASK_STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
];

const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const CATEGORIES = [
  'Engine',
  'Transmission',
  'Suspension',
  'Brakes',
  'Body',
  'Paint',
  'Interior',
  'Electrical',
  'Wheels & Tires',
  'Exhaust',
  'Other',
];

export default function CreateTaskDialog({
  open,
  onClose,
  projectId,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await tasksAPI.create(projectId, {
        ...formData,
        dueDate: formData.dueDate || undefined,
      });
      onTaskCreated();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      category: '',
      dueDate: '',
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              error={!!error && !formData.title}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {TASK_STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                error
                value={error}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
