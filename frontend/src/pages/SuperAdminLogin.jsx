import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuthSimple';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Check if user is Super Admin
        if (data.data.user.role !== 'SUPER_ADMIN') {
          setError('هذا الحساب ليس حساب مدير نظام');
          return;
        }

        // Store auth data
        localStorage.setItem('accessToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Update auth context
        login(data.data.user, data.data.token);
        
        // Redirect to super admin dashboard
        navigate('/super-admin/dashboard');
      } else {
        setError(data.message || 'فشل في تسجيل الدخول');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  mb: 2
                }}
              >
                <AdminIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom align="center">
                مدير النظام
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                تسجيل دخول لوحة تحكم النظام
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="البريد الإلكتروني"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SecurityIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="كلمة المرور"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>

              <Box textAlign="center" mt={2}>
                <Button
                  variant="text"
                  onClick={() => navigate('/auth/login')}
                  size="small"
                >
                  العودة لتسجيل الدخول العادي
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SuperAdminLogin;
