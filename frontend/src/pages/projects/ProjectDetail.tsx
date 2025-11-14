import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
} from '@mui/icons-material';
import { projectsAPI, categoriesAPI, analyticsAPI } from '../../services/api';
import TaskList from '../../components/tasks/TaskList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [parts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    if (!id) return;

    try {
      const [projectRes, categoriesRes, breakdownRes] = await Promise.all([
        projectsAPI.getOne(id),
        categoriesAPI.getByProject(id),
        analyticsAPI.getProjectBreakdown(id),
      ]);

      setProject(projectRes.data);
      setCategories(categoriesRes.data || []);
      setBreakdown(breakdownRes.data || []);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          {project.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {project.vehicleYear} {project.vehicleMake} {project.vehicleModel}
        </Typography>
        <Chip label={project.status} color="primary" sx={{ mt: 1 }} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Budget
            </Typography>
            <Typography variant="h5">
              ${project.totalBudget?.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Spent
            </Typography>
            <Typography variant="h5">
              ${project.totalSpent?.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Remaining
            </Typography>
            <Typography variant="h5">
              ${(project.totalBudget - project.totalSpent)?.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Categories
            </Typography>
            <Typography variant="h5">{categories.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Overview" />
          <Tab label="Categories" />
          <Tab label="Parts" />
          <Tab label="Tasks" />
          <Tab label="Timeline" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Project Description
          </Typography>
          <Typography>{project.description || 'No description provided'}</Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Build Goals
          </Typography>
          <Box>
            {project.goals?.map((goal: string) => (
              <Chip key={goal} label={goal} sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Cost Breakdown by Category
          </Typography>
          <Grid container spacing={2}>
            {breakdown.map((cat: any) => (
              <Grid item xs={12} md={6} key={cat.categoryId}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{cat.categoryName}</Typography>
                  <Typography variant="body2">
                    Budget: ${cat.budgetAllocated?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Spent: ${cat.actualSpent?.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={cat.variance > 0 ? 'error' : 'success.main'}
                  >
                    Variance: ${cat.variance?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Parts: {cat.partsCount}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Parts Inventory</Typography>
            <Button variant="contained" size="small">
              Add Part
            </Button>
          </Box>

          {parts.length === 0 ? (
            <Alert severity="info">
              No parts added yet. Start by adding parts to track your inventory.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Part Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Mock data for demonstration */}
                  {[
                    {
                      name: 'Turbo Kit',
                      category: 'Engine',
                      vendor: 'Speed Shop',
                      quantity: 1,
                      unitCost: 3500,
                      status: 'Ordered'
                    },
                    {
                      name: 'Coilover Suspension',
                      category: 'Suspension',
                      vendor: 'Race Parts Inc',
                      quantity: 1,
                      unitCost: 1800,
                      status: 'Delivered'
                    },
                    {
                      name: 'Brake Rotors',
                      category: 'Brakes',
                      vendor: 'Performance Plus',
                      quantity: 4,
                      unitCost: 250,
                      status: 'Installed'
                    }
                  ].map((part, index) => (
                    <TableRow key={index}>
                      <TableCell>{part.name}</TableCell>
                      <TableCell>{part.category}</TableCell>
                      <TableCell>{part.vendor}</TableCell>
                      <TableCell align="right">{part.quantity}</TableCell>
                      <TableCell align="right">${part.unitCost.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        ${(part.quantity * part.unitCost).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={part.status}
                          size="small"
                          color={
                            part.status === 'Installed' ? 'success' :
                            part.status === 'Delivered' ? 'primary' :
                            'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TaskList projectId={id!} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Project Timeline
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
                Progress
              </Typography>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2">65%</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Project started: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
              {' • '}
              Target completion: {project.targetCompletionDate ? new Date(project.targetCompletionDate).toLocaleDateString() : 'Not set'}
            </Typography>
          </Box>

          <Timeline position="alternate">
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                {new Date(project.startDate || Date.now()).toLocaleDateString()}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="success">
                  <CheckCircle />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6">Project Started</Typography>
                <Typography variant="body2">Initial planning and design phase</Typography>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                Week 2-4
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="success">
                  <CheckCircle />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6">Disassembly</Typography>
                <Typography variant="body2">Complete teardown and inspection</Typography>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                Week 5-8
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  <Schedule />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6">Engine Build</Typography>
                <Typography variant="body2">Engine rebuild and performance upgrades</Typography>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                Week 9-12
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot>
                  <RadioButtonUnchecked />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6">Body & Paint</Typography>
                <Typography variant="body2">Bodywork and custom paint job</Typography>
              </TimelineContent>
            </TimelineItem>

            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                {project.targetCompletionDate ? new Date(project.targetCompletionDate).toLocaleDateString() : 'TBD'}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot>
                  <RadioButtonUnchecked />
                </TimelineDot>
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6">Final Assembly</Typography>
                <Typography variant="body2">Complete assembly and testing</Typography>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </TabPanel>
      </Paper>
    </Box>
  );
}
