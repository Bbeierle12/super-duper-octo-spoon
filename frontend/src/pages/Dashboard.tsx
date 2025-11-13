import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  DirectionsCar,
  AttachMoney,
  TrendingUp,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsAPI, projectsAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [spendingTrend, setSpendingTrend] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          projectsAPI.getAll({ limit: 5 }),
        ]);
        setStats(statsRes.data);
        setRecentProjects(projectsRes.data.data || []);

        // Generate spending trend data (mock for now)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const trendData = months.map((month) => ({
          month,
          budget: Math.floor(Math.random() * 10000) + 5000,
          spent: Math.floor(Math.random() * 8000) + 3000,
        }));
        setSpendingTrend(trendData);

        // Generate budget variance data for active projects
        const projects = projectsRes.data.data || [];
        const budgetVariance = projects.slice(0, 5).map((p: any) => ({
          name: p.name,
          budget: p.totalBudget || 0,
          spent: p.totalSpent || 0,
          variance: (p.totalBudget || 0) - (p.totalSpent || 0),
        }));
        setBudgetData(budgetVariance);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: <DirectionsCar fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: <TrendingUp fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Total Budget',
      value: `$${(stats?.totalBudget || 0).toLocaleString()}`,
      icon: <AttachMoney fontSize="large" />,
      color: '#ed6c02',
    },
    {
      title: 'Completed',
      value: stats?.completedProjects || 0,
      icon: <CheckCircle fontSize="large" />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              <Box>
                <Typography variant="h4">{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Analytics Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Spending Trend Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Spending Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#1976d2"
                  name="Budget"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="spent"
                  stroke="#ff9800"
                  name="Spent"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Budget Variance Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Project Budget Variance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="budget" fill="#1976d2" name="Budget" />
                <Bar dataKey="spent" fill="#ff9800" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Overview */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Project Status Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: stats?.activeProjects || 0, color: '#2e7d32' },
                    { name: 'Planning', value: stats?.planningProjects || 0, color: '#1976d2' },
                    { name: 'On Hold', value: stats?.onHoldProjects || 0, color: '#ff9800' },
                    { name: 'Completed', value: stats?.completedProjects || 0, color: '#9c27b0' },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { color: '#2e7d32' },
                    { color: '#1976d2' },
                    { color: '#ff9800' },
                    { color: '#9c27b0' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Alerts & Warnings */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alerts & Warnings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {budgetData.filter(p => p.spent > p.budget).length > 0 ? (
                budgetData
                  .filter(p => p.spent > p.budget)
                  .map((project, index) => (
                    <Alert severity="warning" key={index} icon={<Warning />}>
                      <strong>{project.name}</strong> is over budget by ${Math.abs(project.variance).toLocaleString()}
                    </Alert>
                  ))
              ) : (
                <Alert severity="success">
                  All projects are within budget!
                </Alert>
              )}
              {stats?.overdueProjects > 0 && (
                <Alert severity="info">
                  {stats.overdueProjects} project(s) are behind schedule
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Recent Projects
      </Typography>

      {recentProjects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No projects yet. Start planning your first build!
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/projects')}
          >
            Create Project
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {recentProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.vehicleYear} {project.vehicleMake} {project.vehicleModel}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Budget: ${project.totalBudget?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Spent: ${project.totalSpent?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Status: <strong>{project.status}</strong>
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
