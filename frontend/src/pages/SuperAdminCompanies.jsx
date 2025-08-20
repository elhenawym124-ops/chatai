import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, edit, view
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    plan: 'BASIC',
    currency: 'EGP',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/v1/admin/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCompanies(data.data.companies);
      } else {
        setError(data.message || 'فشل في جلب الشركات');
      }
    } catch (err) {
      setError('فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompany(null);
  };

  const handleCreateCompany = () => {
    setModalType('create');
    setFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      plan: 'BASIC',
      currency: 'EGP',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: ''
    });
    setModalOpen(true);
    handleMenuClose();
  };

  const handleEditCompany = () => {
    setModalType('edit');
    setFormData({
      name: selectedCompany.name,
      email: selectedCompany.email,
      phone: selectedCompany.phone || '',
      website: selectedCompany.website || '',
      plan: selectedCompany.plan,
      currency: selectedCompany.currency,
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: ''
    });
    setModalOpen(true);
    handleMenuClose();
  };

  const handleViewCompany = () => {
    setModalType('view');
    setModalOpen(true);
    handleMenuClose();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const url = modalType === 'create' 
        ? 'http://localhost:3001/api/v1/admin/companies'
        : `http://localhost:3001/api/v1/admin/companies/${selectedCompany.id}`;
      
      const method = modalType === 'create' ? 'POST' : 'PUT';
      
      const body = modalType === 'create' ? formData : {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        plan: formData.plan,
        currency: formData.currency
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCompanies();
        setModalOpen(false);
        setError(null);
      } else {
        setError(data.message || 'فشل في حفظ الشركة');
      }
    } catch (err) {
      setError('فشل في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'BASIC': return 'info';
      case 'PRO': return 'warning';
      case 'ENTERPRISE': return 'success';
      default: return 'default';
    }
  };

  const getPlanName = (plan) => {
    switch (plan) {
      case 'BASIC': return 'أساسي';
      case 'PRO': return 'احترافي';
      case 'ENTERPRISE': return 'مؤسسي';
      default: return plan;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            إدارة الشركات
          </Typography>
          <Typography variant="body1" color="text.secondary">
            إدارة جميع الشركات في النظام
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCompany}
        >
          إضافة شركة جديدة
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Companies Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>اسم الشركة</TableCell>
                  <TableCell>البريد الإلكتروني</TableCell>
                  <TableCell>الخطة</TableCell>
                  <TableCell>المستخدمين</TableCell>
                  <TableCell>العملاء</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon color="action" />
                        {company.name}
                      </Box>
                    </TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getPlanName(company.plan)} 
                        color={getPlanColor(company.plan)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{company._count.users}</TableCell>
                    <TableCell>{company._count.customers}</TableCell>
                    <TableCell>
                      <Chip 
                        label={company.isActive ? 'نشط' : 'غير نشط'}
                        color={company.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, company)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewCompany}>
          <ViewIcon sx={{ mr: 1 }} />
          عرض التفاصيل
        </MenuItem>
        <MenuItem onClick={handleEditCompany}>
          <EditIcon sx={{ mr: 1 }} />
          تعديل
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          حذف
        </MenuItem>
      </Menu>

      {/* Company Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {modalType === 'create' && 'إضافة شركة جديدة'}
          {modalType === 'edit' && 'تعديل الشركة'}
          {modalType === 'view' && 'تفاصيل الشركة'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="اسم الشركة"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={modalType === 'view'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={modalType === 'view'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>الخطة</InputLabel>
                  <Select
                    value={formData.plan}
                    label="الخطة"
                    onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                    disabled={modalType === 'view'}
                  >
                    <MenuItem value="BASIC">أساسي</MenuItem>
                    <MenuItem value="PRO">احترافي</MenuItem>
                    <MenuItem value="ENTERPRISE">مؤسسي</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>العملة</InputLabel>
                  <Select
                    value={formData.currency}
                    label="العملة"
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    disabled={modalType === 'view'}
                  >
                    <MenuItem value="EGP">جنيه مصري</MenuItem>
                    <MenuItem value="USD">دولار أمريكي</MenuItem>
                    <MenuItem value="EUR">يورو</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {modalType === 'create' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      بيانات مدير الشركة
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="الاسم الأول للمدير"
                      value={formData.adminFirstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, adminFirstName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="الاسم الأخير للمدير"
                      value={formData.adminLastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, adminLastName: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="بريد المدير الإلكتروني"
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="كلمة مرور المدير"
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>
            إلغاء
          </Button>
          {modalType !== 'view' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminCompanies;
