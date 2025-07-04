import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        const result = await login(values);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error('Unexpected login error:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box 
      component="form" 
      onSubmit={formik.handleSubmit} 
      sx={{ mt: 1 }}
      noValidate // Prevent browser validation which can cause reloads
    >
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            fontWeight: error.includes('server') || error.includes('unavailable') ? 'bold' : 'normal'
          }}
          variant={error.includes('server') || error.includes('unavailable') ? 'filled' : 'standard'}
        >
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        value={formik.values.username}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
        disabled={loading}
        autoFocus
        InputProps={{
          sx: { borderRadius: 2 }
        }}
      />

      <TextField
        margin="normal"
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        disabled={loading}
        InputProps={{
          sx: { borderRadius: 2 }
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disableElevation
        sx={{ 
          mt: 3, 
          mb: 2,
          py: 1.5,
          fontSize: '1rem',
          backgroundColor: (theme) => theme.palette.primary.main, // Rich crimson for buttons
          color: '#FFF5E0', // Cream text for high contrast
          '&:hover': {
            backgroundColor: (theme) => theme.palette.primary.dark,
          }
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ display: 'inline' }}
        >
          Don't have an account?{' '}
        </Typography>
        <Typography
          variant="body2"
          color="primary"
          sx={{ 
            display: 'inline',
            fontWeight: 'bold',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
          onClick={() => {
            if (typeof onSwitchToRegister === 'function') {
              onSwitchToRegister();
            }
          }}
        >
          Sign up now
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
