import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
} from '@mui/material'
import AuthLayout from '../components/AuthLayout'

const formKeyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter email and password.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Login failed')
      if (data.token) localStorage.setItem('token', data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle="Sign in to manage your bills and splits in one place.">
      <style>{formKeyframes}</style>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
          animation: 'fadeInUp 0.6s ease-out',
          '& .field': {
            animation: 'fadeInUp 0.6s ease-out backwards',
          },
          '& .field-1': { animationDelay: '0.1s' },
          '& .field-2': { animationDelay: '0.15s' },
          '& .field-3': { animationDelay: '0.2s' },
          '& .field-4': { animationDelay: '0.25s' },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            animation: 'fadeInUp 0.6s ease-out backwards',
            animationDelay: '0.05s',
          }}
        >
          Welcome back
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            animation: 'fadeInUp 0.6s ease-out backwards',
            animationDelay: '0.08s',
          }}
        >
          Enter your details to continue
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            className="field field-1"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            className="field field-2"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="field field-3"
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <Typography
            variant="body2"
            align="center"
            className="field field-4"
            sx={{ color: 'text.secondary' }}
          >
            Don&apos;t have an account?{' '}
            <MuiLink
              component={Link}
              to="/signup"
              underline="hover"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': { color: 'primary.dark' },
              }}
            >
              Sign up
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </AuthLayout>
  )
}
