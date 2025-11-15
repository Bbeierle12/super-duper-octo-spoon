import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import {
  Add,
  Delete,
  Visibility,
  LocalShipping,
  CheckCircle,
} from '@mui/icons-material';
import { purchaseOrdersAPI, vendorsAPI, projectsAPI } from '../../services/api';
import CreatePurchaseOrderDialog from '../../components/purchase-orders/CreatePurchaseOrderDialog';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  projectId: string;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  status: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  items: POItem[];
}

interface POItem {
  id: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  quantityReceived: number;
  receivedDate?: string;
}

interface Project {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

export default function PurchaseOrdersList() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<POItem | null>(null);
  const [receiveQuantity, setReceiveQuantity] = useState(0);

  useEffect(() => {
    fetchData();
  }, [selectedProjectId, selectedVendorId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedProjectId) filters.projectId = selectedProjectId;
      if (selectedVendorId) filters.vendorId = selectedVendorId;

      const [posRes, projectsRes, vendorsRes] = await Promise.all([
        purchaseOrdersAPI.getAll(filters),
        projectsAPI.getAll(),
        vendorsAPI.getAll(),
      ]);

      setPurchaseOrders(posRes.data);
      setProjects(projectsRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) {
      return;
    }

    try {
      await purchaseOrdersAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete purchase order:', error);
    }
  };

  const handleViewDetails = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setDetailDialogOpen(true);
  };

  const handleReceiveItem = (po: PurchaseOrder, item: POItem) => {
    setSelectedPO(po);
    setSelectedItem(item);
    setReceiveQuantity(item.quantity - item.quantityReceived);
    setReceiveDialogOpen(true);
  };

  const handleConfirmReceive = async () => {
    if (!selectedPO || !selectedItem || receiveQuantity <= 0) return;

    try {
      await purchaseOrdersAPI.receiveItems(selectedPO.id, selectedItem.id, receiveQuantity);
      setReceiveDialogOpen(false);
      setSelectedItem(null);
      setReceiveQuantity(0);
      fetchData();
    } catch (error) {
      console.error('Failed to receive items:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
      draft: 'default',
      submitted: 'info',
      confirmed: 'warning',
      shipped: 'warning',
      partial: 'warning',
      received: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Purchase Orders</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create PO
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Project</InputLabel>
              <Select
                value={selectedProjectId}
                label="Filter by Project"
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <MenuItem value="">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Vendor</InputLabel>
              <Select
                value={selectedVendorId}
                label="Filter by Vendor"
                onChange={(e) => setSelectedVendorId(e.target.value)}
              >
                <MenuItem value="">All Vendors</MenuItem>
                {vendors.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PO Number</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading purchase orders...
                </TableCell>
              </TableRow>
            ) : purchaseOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No purchase orders found. Click "Create PO" to create one.
                </TableCell>
              </TableRow>
            ) : (
              purchaseOrders.map((po) => (
                <TableRow key={po.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {po.poNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{po.project.name}</TableCell>
                  <TableCell>{po.vendor.name}</TableCell>
                  <TableCell>{formatDate(po.orderDate)}</TableCell>
                  <TableCell>{formatDate(po.expectedDeliveryDate)}</TableCell>
                  <TableCell>
                    <Chip label={po.status.toUpperCase()} color={getStatusColor(po.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(po.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(po)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(po.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create PO Dialog */}
      <CreatePurchaseOrderDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchData();
        }}
        projects={projects}
        vendors={vendors}
      />

      {/* PO Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Purchase Order Details - {selectedPO?.poNumber}
        </DialogTitle>
        <DialogContent>
          {selectedPO && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Project
                  </Typography>
                  <Typography variant="body1">{selectedPO.project.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Vendor
                  </Typography>
                  <Typography variant="body1">{selectedPO.vendor.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1">{formatDate(selectedPO.orderDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Expected Delivery
                  </Typography>
                  <Typography variant="body1">{formatDate(selectedPO.expectedDeliveryDate)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedPO.status.toUpperCase()} color={getStatusColor(selectedPO.status)} />
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Part Name</TableCell>
                      <TableCell>Part Number</TableCell>
                      <TableCell align="right">Qty Ordered</TableCell>
                      <TableCell align="right">Qty Received</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPO.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.partName}</TableCell>
                        <TableCell>{item.partNumber || '-'}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {item.quantityReceived}
                          {item.quantityReceived === item.quantity && (
                            <CheckCircle color="success" sx={{ ml: 1, verticalAlign: 'middle' }} fontSize="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                        <TableCell align="right">
                          {item.quantityReceived < item.quantity && (
                            <Tooltip title="Receive Items">
                              <IconButton size="small" onClick={() => handleReceiveItem(selectedPO, item)}>
                                <LocalShipping fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Box>
                  <Typography variant="body2">
                    Subtotal: {formatCurrency(selectedPO.subtotal)}
                  </Typography>
                  <Typography variant="body2">
                    Tax: {formatCurrency(selectedPO.tax)}
                  </Typography>
                  <Typography variant="body2">
                    Shipping: {formatCurrency(selectedPO.shipping)}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Total: {formatCurrency(selectedPO.totalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Receive Items Dialog */}
      <Dialog open={receiveDialogOpen} onClose={() => setReceiveDialogOpen(false)}>
        <DialogTitle>Receive Items</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Part: <strong>{selectedItem.partName}</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                Ordered: {selectedItem.quantity}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Already Received: {selectedItem.quantityReceived}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Remaining: {selectedItem.quantity - selectedItem.quantityReceived}
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Quantity to Receive"
                value={receiveQuantity}
                onChange={(e) => setReceiveQuantity(Number(e.target.value))}
                inputProps={{
                  min: 0,
                  max: selectedItem.quantity - selectedItem.quantityReceived,
                }}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReceive}
            variant="contained"
            disabled={receiveQuantity <= 0}
          >
            Confirm Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
