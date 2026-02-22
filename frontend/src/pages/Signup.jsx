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

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Sign up failed')
      if (data.token) localStorage.setItem('token', data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle="Create an account and start splitting bills the smart way.">
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
          '& .field-5': { animationDelay: '0.3s' },
          '& .field-6': { animationDelay: '0.35s' },
          '& .field-7': { animationDelay: '0.4s' },
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
          Create account
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
          Fill in your details to get started
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
            id="name"
            label="Full name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            className="field field-2"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            className="field field-3"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 6 characters"
          />
          <TextField
            className="field field-4"
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            className="field field-5"
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
            {loading ? 'Creating account…' : 'Sign up'}
          </Button>
          <Typography
            variant="body2"
            align="center"
            className="field field-6"
            sx={{ color: 'text.secondary' }}
          >
            Already have an account?{' '}
            <MuiLink
              component={Link}
              to="/login"
              underline="hover"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': { color: 'primary.dark' },
              }}
            >
              Sign in
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </AuthLayout>
  )
}
