import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material'
import { useAuth } from '../../context/AuthContext'

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .required('Username is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  })

  const formik = useFormik({
    initialValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      setError('')

      try {
        const { confirmPassword, ...registerData } = values
        const result = await register(registerData)

        if (result.success) {
          // Registration successful, switch to login tab
          onSuccess()
        } else {
          setError(result.error)
        }
      } catch (err) {
        console.error('Unexpected registration error:', err);
        setError('An unexpected error occurred. Please try again later.')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <Box component='form' onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert 
          severity='error' 
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
        margin='normal'
        fullWidth
        id='username'
        label='Username'
        name='username'
        autoComplete='username'
        value={formik.values.username}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
        disabled={loading}
        autoFocus
        InputProps={{
          sx: { borderRadius: 2 },
        }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          margin='normal'
          fullWidth
          id='firstName'
          label='First Name'
          name='firstName'
          autoComplete='given-name'
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
          disabled={loading}
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />

        <TextField
          margin='normal'
          fullWidth
          id='lastName'
          label='Last Name'
          name='lastName'
          autoComplete='family-name'
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          disabled={loading}
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />
      </Box>

      <TextField
        margin='normal'
        fullWidth
        id='email'
        label='Email Address'
        name='email'
        autoComplete='email'
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        disabled={loading}
        InputProps={{
          sx: { borderRadius: 2 },
        }}
      />

      <TextField
        margin='normal'
        fullWidth
        name='password'
        label='Password'
        type='password'
        id='password'
        autoComplete='new-password'
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        disabled={loading}
        InputProps={{
          sx: { borderRadius: 2 },
        }}
      />

      <TextField
        margin='normal'
        fullWidth
        name='confirmPassword'
        label='Confirm Password'
        type='password'
        id='confirmPassword'
        autoComplete='new-password'
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        disabled={loading}
        InputProps={{
          sx: { borderRadius: 2 },
        }}
      />

      <Button
        type='submit'
        fullWidth
        variant='contained'
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          fontSize: '1rem',
          backgroundColor: (theme) => theme.palette.primary.main,
          '&:hover': {
            backgroundColor: (theme) => theme.palette.primary.dark,
          },
        }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Account'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant='body2' color='text.secondary' sx={{ display: 'inline' }}>
          Already have an account?{' '}
        </Typography>
        <Typography
          variant='body2'
          color='primary'
          sx={{
            display: 'inline',
            fontWeight: 'bold',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => {
            if (typeof onSwitchToLogin === 'function') {
              onSwitchToLogin()
            }
          }}
        >
          Sign in here
        </Typography>
      </Box>
    </Box>
  )
}

export default RegisterForm
