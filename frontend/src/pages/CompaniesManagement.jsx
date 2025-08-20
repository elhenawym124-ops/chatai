import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  CircularProgress,
  Pagination,
  TableSortLabel,
  Avatar,
  LinearProgress,
  FormControlLabel,
  Switch
} from '@mui/material';

import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Chat as ConversationsIcon,
  Inventory as ProductsIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const CompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form state for new/edit company
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    plan: 'BASIC',
    currency: 'EGP',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Filters and sorting
  const [filters, setFilters] = useState({
    search: '',
    plan: '',
    isActive: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Plans data
  const [plans, setPlans] = useState({});

  // Fetch companies data
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters
      });

      const response = await fetch(`http://localhost:3001/api/v1/companies?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'فشل في جلب الشركات');
      }

      setCompanies(data.data.companies || []);
      if (data.data.pagination) {
        setPagination(data.data.pagination);
      }

    } catch (err) {
      setError('فشل في جلب البيانات: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/companies/plans');
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    setPagination(prev => ({ ...prev, limit: event.target.value, page: 1 }));
  };

  const handleSortChange = (newSortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // View company details
  const handleViewCompany = async (company) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/companies/${company.id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedCompany(data.data);
        setDetailsModalOpen(true);
      }
    } catch (err) {
      setError('فشل في جلب تفاصيل الشركة');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      plan: 'BASIC',
      currency: 'EGP',
      isActive: true
    });
    setFormErrors({});
  };

  // Open new company modal
  const handleAddCompany = () => {
    resetForm();
    setModalOpen(true);
  };

  // Open edit company modal
  const handleEditCompany = (company) => {
    setFormData({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      website: company.website || '',
      address: company.address || '',
      plan: company.plan || 'BASIC',
      currency: company.currency || 'EGP',
      isActive: company.isActive !== undefined ? company.isActive : true
    });
    setSelectedCompany(company);
    setEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'اسم الشركة مطلوب';
    }

    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'رابط الموقع يجب أن يبدأ بـ http:// أو https://';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const url = editModalOpen
        ? `http://localhost:3001/api/v1/companies/${selectedCompany.id}`
        : 'http://localhost:3001/api/v1/companies';

      const method = editModalOpen ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Refresh companies list
        await fetchCompanies();

        // Close modal and reset form
        setModalOpen(false);
        setEditModalOpen(false);
        resetForm();
        setSelectedCompany(null);

        // Show success message
        setError(null);
      } else {
        setError(data.message || 'فشل في حفظ الشركة');
      }
    } catch (err) {
      setError('فشل في حفظ الشركة: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete company
  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`هل أنت متأكد من حذف شركة "${company.name}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/v1/companies/${company.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchCompanies();
        setError(null);
      } else {
        setError(data.message || 'فشل في حذف الشركة');
      }
    } catch (err) {
      setError('فشل في حذف الشركة: ' + err.message);
    }
  };

  // Get plan color
  const getPlanColor = (plan) => {
    switch (plan) {
      case 'BASIC': return 'primary';
      case 'PRO': return 'secondary';
      case 'ENTERPRISE': return 'success';
      default: return 'default';
    }
  };

  // Get plan name in Arabic
  const getPlanName = (plan) => {
    const planNames = {
      'BASIC': 'أساسي',
      'PRO': 'احترافي',
      'ENTERPRISE': 'مؤسسي'
    };
    return planNames[plan] || plan;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  // Effects
  useEffect(() => {
    fetchCompanies();
  }, [pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading && companies.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          إدارة الشركات
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCompany}
        >
          إضافة شركة جديدة
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{pagination.total || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الشركات
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {companies.filter(c => c.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    شركات نشطة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {companies.reduce((sum, c) => sum + (c._count?.users || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المستخدمين
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ConversationsIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {companies.reduce((sum, c) => sum + (c._count?.conversations || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المحادثات
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="البحث"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>الخطة</InputLabel>
                <Select
                  value={filters.plan}
                  label="الخطة"
                  onChange={(e) => handleFilterChange('plan', e.target.value)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="BASIC">أساسي</MenuItem>
                  <MenuItem value="PRO">احترافي</MenuItem>
                  <MenuItem value="ENTERPRISE">مؤسسي</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={filters.isActive}
                  label="الحالة"
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="true">نشط</MenuItem>
                  <MenuItem value="false">غير نشط</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>عدد العناصر</InputLabel>
                <Select
                  value={pagination.limit}
                  label="عدد العناصر"
                  onChange={handleLimitChange}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الشركة</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'plan'}
                      direction={sortBy === 'plan' ? sortOrder : 'desc'}
                      onClick={() => handleSortChange('plan')}
                    >
                      الخطة
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">المستخدمين</TableCell>
                  <TableCell align="center">العملاء</TableCell>
                  <TableCell align="center">المنتجات</TableCell>
                  <TableCell align="center">المحادثات</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={sortBy === 'createdAt'}
                      direction={sortBy === 'createdAt' ? sortOrder : 'desc'}
                      onClick={() => handleSortChange('createdAt')}
                    >
                      تاريخ الإنشاء
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {company.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {company.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getPlanName(company.plan)}
                        color={getPlanColor(company.plan)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <PeopleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {company._count?.users || 0}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <PeopleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {company._count?.customers || 0}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <ProductsIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {company._count?.products || 0}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <ConversationsIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {company._count?.conversations || 0}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={company.isActive ? 'نشط' : 'غير نشط'}
                        color={company.isActive ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2">
                        {formatDate(company.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="عرض التفاصيل">
                        <IconButton
                          size="small"
                          onClick={() => handleViewCompany(company)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تعديل">
                        <IconButton
                          size="small"
                          onClick={() => handleEditCompany(company)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCompany(company)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {companies.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                لا توجد شركات مطابقة للفلاتر المحددة
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                عرض {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total} شركة
              </Typography>

              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Company Details Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          تفاصيل الشركة
        </DialogTitle>
        <DialogContent>
          {selectedCompany && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  معلومات أساسية
                </Typography>
                <Typography><strong>الاسم:</strong> {selectedCompany.name}</Typography>
                <Typography><strong>البريد الإلكتروني:</strong> {selectedCompany.email}</Typography>
                <Typography><strong>الهاتف:</strong> {selectedCompany.phone || 'غير محدد'}</Typography>
                <Typography><strong>الموقع:</strong> {selectedCompany.website || 'غير محدد'}</Typography>
                <Typography><strong>العنوان:</strong> {selectedCompany.address || 'غير محدد'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  الاشتراك والإحصائيات
                </Typography>
                <Typography><strong>الخطة:</strong> {getPlanName(selectedCompany.plan)}</Typography>
                <Typography><strong>الحالة:</strong> {selectedCompany.isActive ? 'نشط' : 'غير نشط'}</Typography>
                <Typography><strong>المستخدمين:</strong> {selectedCompany._count?.users || 0}</Typography>
                <Typography><strong>العملاء:</strong> {selectedCompany._count?.customers || 0}</Typography>
                <Typography><strong>المنتجات:</strong> {selectedCompany._count?.products || 0}</Typography>
                <Typography><strong>الطلبات:</strong> {selectedCompany._count?.orders || 0}</Typography>
                <Typography><strong>المحادثات:</strong> {selectedCompany._count?.conversations || 0}</Typography>
              </Grid>

              {selectedCompany.users && selectedCompany.users.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    المستخدمين
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>الاسم</TableCell>
                        <TableCell>البريد الإلكتروني</TableCell>
                        <TableCell>الدور</TableCell>
                        <TableCell>الحالة</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedCompany.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.firstName} {user.lastName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.isActive ? 'نشط' : 'غير نشط'}
                              color={user.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Company Modal */}
      <Dialog
        open={modalOpen || editModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditModalOpen(false);
          resetForm();
          setSelectedCompany(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editModalOpen ? 'تعديل الشركة' : 'إضافة شركة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="اسم الشركة *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="البريد الإلكتروني *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="موقع الويب"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                error={!!formErrors.website}
                helperText={formErrors.website}
                disabled={submitting}
                placeholder="https://example.com"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="العنوان"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={!!formErrors.address}
                helperText={formErrors.address}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>خطة الاشتراك</InputLabel>
                <Select
                  value={formData.plan}
                  label="خطة الاشتراك"
                  onChange={(e) => handleInputChange('plan', e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="BASIC">أساسي</MenuItem>
                  <MenuItem value="PRO">احترافي</MenuItem>
                  <MenuItem value="ENTERPRISE">مؤسسي</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>العملة</InputLabel>
                <Select
                  value={formData.currency}
                  label="العملة"
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="EGP">جنيه مصري (EGP)</MenuItem>
                  <MenuItem value="SAR">ريال سعودي (SAR)</MenuItem>
                  <MenuItem value="USD">دولار أمريكي (USD)</MenuItem>
                  <MenuItem value="EUR">يورو (EUR)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    disabled={submitting}
                  />
                }
                label="نشط"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setModalOpen(false);
              setEditModalOpen(false);
              resetForm();
              setSelectedCompany(null);
            }}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'جاري الحفظ...' : (editModalOpen ? 'تحديث' : 'إنشاء')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompaniesManagement;
