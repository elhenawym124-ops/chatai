import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Grid,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const WalletManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [walletNumbers, setWalletNumbers] = useState([]);
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [editingWallet, setEditingWallet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    icon: '',
    color: '#000000'
  });

  useEffect(() => {
    fetchWalletNumbers();
    fetchPendingReceipts();
  }, []);

  const fetchWalletNumbers = async () => {
    try {
      const response = await axios.get('/api/v1/wallet-payment/admin/wallet-numbers');
      if (response.data.success) {
        setWalletNumbers(response.data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب أرقام المحافظ:', error);
    }
  };

  const fetchPendingReceipts = async () => {
    try {
      const response = await axios.get('/api/v1/wallet-payment/admin/pending-receipts');
      if (response.data.success) {
        setPendingReceipts(response.data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب الإيصالات:', error);
    }
  };

  const handleSaveWallet = async () => {
    try {
      setLoading(true);
      if (editingWallet) {
        await axios.put(`/api/v1/wallet-payment/admin/wallet-numbers/${editingWallet.id}`, formData);
      } else {
        await axios.post('/api/v1/wallet-payment/admin/wallet-numbers', formData);
      }
      
      setDialogOpen(false);
      setEditingWallet(null);
      setFormData({ name: '', number: '', icon: '', color: '#000000' });
      fetchWalletNumbers();
    } catch (error) {
      console.error('خطأ في حفظ المحفظة:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const wallet = walletNumbers.find(w => w.id === id);
      await axios.put(`/api/v1/wallet-payment/admin/wallet-numbers/${id}`, {
        ...wallet,
        isActive: !isActive
      });
      fetchWalletNumbers();
    } catch (error) {
      console.error('خطأ في تحديث حالة المحفظة:', error);
    }
  };

  const handleDeleteWallet = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المحفظة؟')) {
      try {
        await axios.delete(`/api/v1/wallet-payment/admin/wallet-numbers/${id}`);
        fetchWalletNumbers();
      } catch (error) {
        console.error('خطأ في حذف المحفظة:', error);
      }
    }
  };

  const handleReviewReceipt = async (receiptId, action, notes = '') => {
    try {
      await axios.post(`/api/v1/wallet-payment/admin/review-receipt/${receiptId}`, {
        action,
        notes
      });
      
      setReceiptDialogOpen(false);
      setSelectedReceipt(null);
      fetchPendingReceipts();
    } catch (error) {
      console.error('خطأ في مراجعة الإيصال:', error);
    }
  };

  const openEditDialog = (wallet = null) => {
    if (wallet) {
      setEditingWallet(wallet);
      setFormData({
        name: wallet.name,
        number: wallet.number,
        icon: wallet.icon,
        color: wallet.color
      });
    } else {
      setEditingWallet(null);
      setFormData({ name: '', number: '', icon: '', color: '#000000' });
    }
    setDialogOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        💳 إدارة المحافظ والمدفوعات
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="أرقام المحافظ" />
        <Tab 
          label={
            <Badge badgeContent={pendingReceipts.length} color="error">
              الإيصالات المعلقة
            </Badge>
          } 
        />
      </Tabs>

      {/* تبويب أرقام المحافظ */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">أرقام المحافظ</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openEditDialog()}
              >
                إضافة محفظة جديدة
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>المحفظة</TableCell>
                    <TableCell>الرقم</TableCell>
                    <TableCell>الحالة</TableCell>
                    <TableCell>تاريخ الإضافة</TableCell>
                    <TableCell>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {walletNumbers.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <span style={{ marginRight: 8 }}>{wallet.icon}</span>
                          <Typography variant="body2" fontWeight="bold">
                            {wallet.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {wallet.number}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={wallet.isActive}
                          onChange={() => handleToggleActive(wallet.id, wallet.isActive)}
                          color="primary"
                        />
                        <Chip
                          label={wallet.isActive ? 'نشط' : 'معطل'}
                          color={wallet.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(wallet.createdAt)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => openEditDialog(wallet)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteWallet(wallet.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* تبويب الإيصالات المعلقة */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              الإيصالات في انتظار المراجعة ({pendingReceipts.length})
            </Typography>

            {pendingReceipts.length === 0 ? (
              <Alert severity="info">لا توجد إيصالات في انتظار المراجعة</Alert>
            ) : (
              <Grid container spacing={2}>
                {pendingReceipts.map((receipt) => (
                  <Grid item xs={12} md={6} lg={4} key={receipt.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          فاتورة: {receipt.invoice.invoiceNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          الشركة: {receipt.invoice.company.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          المبلغ: {formatCurrency(receipt.invoice.totalAmount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          المحفظة: {receipt.walletNumber.icon} {receipt.walletNumber.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          تاريخ الإرسال: {formatDate(receipt.submittedAt)}
                        </Typography>
                        
                        <Box mt={2} display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => {
                              setSelectedReceipt(receipt);
                              setReceiptDialogOpen(true);
                            }}
                          >
                            مراجعة
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleReviewReceipt(receipt.id, 'approve')}
                          >
                            موافقة
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={() => handleReviewReceipt(receipt.id, 'reject')}
                          >
                            رفض
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* حوار إضافة/تعديل المحفظة */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWallet ? 'تعديل المحفظة' : 'إضافة محفظة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="اسم المحفظة"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: فودافون كاش"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="رقم المحفظة"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="مثال: 01234567890"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="الأيقونة"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="مثال: 📱"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="color"
                label="اللون"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleSaveWallet} 
            variant="contained"
            disabled={loading || !formData.name || !formData.number}
          >
            {editingWallet ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار مراجعة الإيصال */}
      <Dialog 
        open={receiptDialogOpen} 
        onClose={() => setReceiptDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>مراجعة إيصال الدفع</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box>
              <Typography variant="h6" gutterBottom>
                تفاصيل الفاتورة
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    رقم الفاتورة
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedReceipt.invoice.invoiceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    الشركة
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedReceipt.invoice.company.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    المبلغ
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(selectedReceipt.invoice.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    المحفظة المستخدمة
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedReceipt.walletNumber.icon} {selectedReceipt.walletNumber.name}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                إيصال التحويل
              </Typography>
              <Box 
                component="img"
                src={`/${selectedReceipt.receiptImage}`}
                alt="إيصال التحويل"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)}>إغلاق</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => handleReviewReceipt(selectedReceipt?.id, 'reject')}
          >
            رفض
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => handleReviewReceipt(selectedReceipt?.id, 'approve')}
          >
            موافقة وتأكيد الدفع
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletManagement;
