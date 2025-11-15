import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { purchaseOrdersAPI } from '../../services/api';

interface Project {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface POItem {
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
}

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: Project[];
  vendors: Vendor[];
}

export default function CreatePurchaseOrderDialog({
  open,
  onClose,
  onSuccess,
  projects,
  vendors,
}: CreatePurchaseOrderDialogProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    vendorId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    tax: 0,
    shipping: 0,
    notes: '',
  });

  const [items, setItems] = useState<POItem[]>([
    { partName: '', partNumber: '', quantity: 1, unitPrice: 0 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { partName: '', partNumber: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof POItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + formData.tax + formData.shipping;
  };

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.vendorId) {
      alert('Please select both project and vendor');
      return;
    }

    if (items.length === 0 || items.some((item) => !item.partName || item.quantity <= 0)) {
      alert('Please add at least one valid item');
      return;
    }

    try {
      await purchaseOrdersAPI.create({
        projectId: formData.projectId,
        vendorId: formData.vendorId,
        orderDate: formData.orderDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        tax: formData.tax,
        shipping: formData.shipping,
        notes: formData.notes,
        items: items.map((item) => ({
          partName: item.partName,
          partNumber: item.partNumber || undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      // Reset form
      setFormData({
        projectId: '',
        vendorId: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        tax: 0,
        shipping: 0,
        notes: '',
      });
      setItems([{ partName: '', partNumber: '', quantity: 1, unitPrice: 0 }]);

      onSuccess();
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      alert('Failed to create purchase order');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Create Purchase Order</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.projectId}
                label="Project"
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Vendor</InputLabel>
              <Select
                value={formData.vendorId}
                label="Vendor"
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
              >
                {vendors.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Order Date"
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Expected Delivery Date"
              value={formData.expectedDeliveryDate}
              onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Items</Typography>
            <Button startIcon={<Add />} onClick={handleAddItem} size="small">
              Add Item
            </Button>
          </Box>

          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Part Name *</TableCell>
                  <TableCell>Part Number</TableCell>
                  <TableCell width={100}>Qty *</TableCell>
                  <TableCell width={120}>Unit Price *</TableCell>
                  <TableCell width={120}>Total</TableCell>
                  <TableCell width={60}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={item.partName}
                        onChange={(e) => handleItemChange(index, 'partName', e.target.value)}
                        placeholder="Part name"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={item.partNumber}
                        onChange={(e) => handleItemChange(index, 'partNumber', e.target.value)}
                        placeholder="Part #"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tax"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Shipping"
                    value={formData.shipping}
                    onChange={(e) => setFormData({ ...formData, shipping: Number(e.target.value) })}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  Subtotal: {formatCurrency(calculateSubtotal())}
                </Typography>
                <Typography variant="body2">Tax: {formatCurrency(formData.tax)}</Typography>
                <Typography variant="body2">
                  Shipping: {formatCurrency(formData.shipping)}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Total: {formatCurrency(calculateTotal())}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.projectId || !formData.vendorId || items.length === 0}
        >
          Create Purchase Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}
