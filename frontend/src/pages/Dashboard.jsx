import { Link } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'

export default function Dashboard() {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        You’re logged in. Add your bills and analytics pages here.
      </Typography>
      <Button component={Link} to="/login" variant="outlined">
        Back to Login
      </Button>
    </Box>
  )
}
