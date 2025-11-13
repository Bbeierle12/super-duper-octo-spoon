import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  Chip,
  FormControl,
  FormLabel,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { projectsAPI } from '../../services/api';

const steps = ['Basic Information', 'Budget & Timeline', 'Build Goals'];

interface ProjectFormData {
  name: string;
  customer: string;
  description: string;
  totalBudget: number;
  startDate: Dayjs | null;
  targetCompletionDate: Dayjs | null;
  goals: string[];
  currentGoal: string;
}

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    customer: '',
    description: '',
    totalBudget: 0,
    startDate: dayjs(),
    targetCompletionDate: dayjs().add(3, 'months'),
    goals: [],
    currentGoal: '',
  });

  const handleNext = () => {
    setError(null);

    // Validate current step
    if (activeStep === 0) {
      if (!formData.name || !formData.customer) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.totalBudget || formData.totalBudget <= 0) {
        setError('Please enter a valid budget amount');
        return;
      }
      if (!formData.startDate || !formData.targetCompletionDate) {
        setError('Please select valid dates');
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate?.toISOString(),
        targetCompletionDate: formData.targetCompletionDate?.toISOString(),
      };

      await projectsAPI.create(projectData);
      navigate('/projects');
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    }
  };

  const addGoal = () => {
    if (formData.currentGoal.trim()) {
      setFormData({
        ...formData,
        goals: [...formData.goals, formData.currentGoal.trim()],
        currentGoal: '',
      });
    }
  };

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index),
    });
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 1970 Challenger Restoration"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Customer Name"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="e.g., John Smith"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Project Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the project scope and objectives..."
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Total Budget"
                value={formData.totalBudget || ''}
                onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="50000"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date: Dayjs | null) => setFormData({ ...formData, startDate: date })}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Target Completion Date"
                  value={formData.targetCompletionDate}
                  onChange={(date: Dayjs | null) => setFormData({ ...formData, targetCompletionDate: date })}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Build Goals</FormLabel>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.currentGoal}
                    onChange={(e) => setFormData({ ...formData, currentGoal: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                    placeholder="e.g., Full frame-off restoration"
                  />
                  <Button variant="outlined" onClick={addGoal}>
                    Add
                  </Button>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.goals.map((goal, index) => (
                    <Chip
                      key={index}
                      label={goal}
                      onDelete={() => removeGoal(index)}
                    />
                  ))}
                </Box>
              </FormControl>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Project
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 300 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          <Button onClick={() => navigate('/projects')} sx={{ mr: 1 }}>
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit}>
              Create Project
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}