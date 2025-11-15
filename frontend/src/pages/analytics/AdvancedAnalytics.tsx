import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { analyticsAPI } from '../../services/api';

interface PortfolioMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgetHealth: {
    onBudget: number;
    overBudget: number;
    underBudget: number;
  };
  portfolioCompletion: number;
}

interface SpendingTrend {
  period: string;
  partsCost: number;
  laborCost: number;
  total: number;
  projectCount: number;
}

export default function AdvancedAnalytics() {
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [portfolioRes, trendsRes] = await Promise.all([
        analyticsAPI.getPortfolioMetrics(),
        analyticsAPI.getSpendingTrends(6),
      ]);
      setPortfolioMetrics(portfolioRes.data);
      setSpendingTrends(trendsRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading || !portfolioMetrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  const budgetUtilization = (portfolioMetrics.totalSpent / portfolioMetrics.totalBudget) * 100;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Portfolio Analytics
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h4">{portfolioMetrics.totalProjects}</Typography>
              <Typography variant="caption" color="primary">
                {portfolioMetrics.activeProjects} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4">{formatCurrency(portfolioMetrics.totalBudget)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4">{formatCurrency(portfolioMetrics.totalSpent)}</Typography>
              <Typography variant="caption" color={budgetUtilization > 100 ? 'error' : 'success.main'}>
                {budgetUtilization.toFixed(1)}% utilized
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Remaining Budget
              </Typography>
              <Typography variant="h4" color={portfolioMetrics.totalRemaining < 0 ? 'error' : 'inherit'}>
                {formatCurrency(portfolioMetrics.totalRemaining)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Completion */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Portfolio Completion
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <LinearProgress
              variant="determinate"
              value={portfolioMetrics.portfolioCompletion}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" fontWeight="medium">
            {portfolioMetrics.portfolioCompletion}%
          </Typography>
        </Box>
      </Paper>

      {/* Budget Health */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Budget Health
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircle color="success" />
              <Box>
                <Typography variant="h5">{portfolioMetrics.budgetHealth.onBudget}</Typography>
                <Typography variant="body2" color="text.secondary">
                  On Budget
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Warning color="warning" />
              <Box>
                <Typography variant="h5">{portfolioMetrics.budgetHealth.underBudget}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Under Budget
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ErrorIcon color="error" />
              <Box>
                <Typography variant="h5">{portfolioMetrics.budgetHealth.overBudget}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Over Budget
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Spending Trends */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Spending Trends (Last 6 Months)
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell align="right">Parts Cost</TableCell>
                <TableCell align="right">Labor Cost</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Projects</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spendingTrends.map((trend) => (
                <TableRow key={trend.period}>
                  <TableCell>{trend.period}</TableCell>
                  <TableCell align="right">{formatCurrency(trend.partsCost)}</TableCell>
                  <TableCell align="right">{formatCurrency(trend.laborCost)}</TableCell>
                  <TableCell align="right">
                    <strong>{formatCurrency(trend.total)}</strong>
                  </TableCell>
                  <TableCell align="right">{trend.projectCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {spendingTrends.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            No spending data available yet
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
