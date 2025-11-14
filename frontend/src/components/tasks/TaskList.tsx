import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  PlayArrow,
  Block,
  Restore,
} from '@mui/icons-material';
import { tasksAPI } from '../../services/api';
import CreateTaskDialog from './CreateTaskDialog';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  dueDate?: string;
  assignedToId?: string;
  createdAt: string;
}

interface TaskListProps {
  projectId: string;
}

const STATUS_COLORS: Record<string, any> = {
  backlog: 'default',
  todo: 'info',
  in_progress: 'primary',
  blocked: 'error',
  completed: 'success',
};

const PRIORITY_COLORS: Record<string, any> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
};

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

export default function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId, filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const response = await tasksAPI.getByProject(projectId, cleanFilters);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTask(null);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      fetchTasks();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      fetchTasks();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && selectedTask?.status !== 'completed';
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Tasks</Typography>
        <Button
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Task
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filters.status}
                label="Filter by Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="backlog">Backlog</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Filter by Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={filters.category}
                label="Filter by Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Engine">Engine</MenuItem>
                <MenuItem value="Transmission">Transmission</MenuItem>
                <MenuItem value="Suspension">Suspension</MenuItem>
                <MenuItem value="Brakes">Brakes</MenuItem>
                <MenuItem value="Body">Body</MenuItem>
                <MenuItem value="Paint">Paint</MenuItem>
                <MenuItem value="Interior">Interior</MenuItem>
                <MenuItem value="Electrical">Electrical</MenuItem>
                <MenuItem value="Wheels & Tires">Wheels & Tires</MenuItem>
                <MenuItem value="Exhaust">Exhaust</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No tasks found. Click "Add Task" to create one.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="caption" color="text.secondary">
                        {task.description.substring(0, 60)}
                        {task.description.length > 60 ? '...' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[task.status] || task.status}
                      color={STATUS_COLORS[task.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      color={PRIORITY_COLORS[task.priority]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{task.category || '-'}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={isOverdue(task.dueDate) ? 'error' : 'text.primary'}
                    >
                      {formatDate(task.dueDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, task)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedTask && handleStatusChange(selectedTask.id, 'todo')}>
          <ListItemIcon>
            <Restore fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as To Do</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedTask && handleStatusChange(selectedTask.id, 'in_progress')}>
          <ListItemIcon>
            <PlayArrow fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as In Progress</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedTask && handleStatusChange(selectedTask.id, 'blocked')}>
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Blocked</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedTask && handleStatusChange(selectedTask.id, 'completed')}>
          <ListItemIcon>
            <CheckCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Completed</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedTask && handleDeleteTask(selectedTask.id)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
        </MenuItem>
      </Menu>

      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        projectId={projectId}
        onTaskCreated={fetchTasks}
      />
    </Box>
  );
}
