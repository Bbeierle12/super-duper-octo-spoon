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
} from '@mui/material';
import { projectsAPI, categoriesAPI, analyticsAPI } from '../../services/api';

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
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Overview" />
          <Tab label="Categories" />
          <Tab label="Parts" />
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
          <Typography>Parts list coming soon...</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography>Timeline view coming soon...</Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
}
