import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { projectsAPI } from '../../services/api';

export default function ProjectsList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      planning: 'default',
      teardown: 'info',
      fabrication: 'warning',
      paint: 'secondary',
      assembly: 'primary',
      completed: 'success',
      on_hold: 'error',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress aria-label="Loading projects" />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
          aria-label="Create new project"
        >
          New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }} role="region" aria-label="No projects">
          <Typography variant="body1" color="text.secondary">
            No projects yet. Create your first project to get started!
          </Typography>
        </Paper>
      ) : isMobile ? (
        // Mobile Card View
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid item xs={12} key={project.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Typography variant="h6" component="h2">
                      {project.name}
                    </Typography>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                      aria-label={`Status: ${project.status}`}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {project.vehicleYear} {project.vehicleMake} {project.vehicleModel}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Budget
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(project.totalBudget)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Spent
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(project.totalSpent)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Remaining
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          color={
                            (project.totalBudget - project.totalSpent) < 0
                              ? 'error.main'
                              : 'text.primary'
                          }
                        >
                          {formatCurrency(project.totalBudget - project.totalSpent)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    aria-label={`View ${project.name} details`}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/edit`);
                    }}
                    aria-label={`Edit ${project.name}`}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper}>
          <Table aria-label="Projects table">
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Budget</TableCell>
                <TableCell align="right">Spent</TableCell>
                <TableCell align="right">Remaining</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/projects/${project.id}`);
                    }
                  }}
                  aria-label={`Project: ${project.name}`}
                >
                  <TableCell component="th" scope="row">
                    {project.name}
                  </TableCell>
                  <TableCell>
                    {project.vehicleYear} {project.vehicleMake} {project.vehicleModel}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                      aria-label={`Status: ${project.status}`}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(project.totalBudget)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(project.totalSpent)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (project.totalBudget - project.totalSpent) < 0
                        ? theme.palette.error.main
                        : 'inherit',
                    }}
                  >
                    {formatCurrency(project.totalBudget - project.totalSpent)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}`);
                          }}
                          aria-label={`View ${project.name} details`}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit project">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}/edit`);
                          }}
                          aria-label={`Edit ${project.name}`}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}