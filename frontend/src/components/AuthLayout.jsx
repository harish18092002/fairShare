import { Box, Typography } from '@mui/material'

export default function AuthLayout({ subtitle, children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: { md: '1 1 45%' },
          minHeight: { xs: '220px', md: '100vh' },
          background: 'linear-gradient(135deg, #012a22 0%, #0d3329 30%, #0a4d3c 60%, #00695c 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 4,
          py: 6,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            sx={{
              color: 'white',
              textShadow: '0 2px 20px rgba(0,0,0,0.25)',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 0,
              letterSpacing: '-0.02em',
            }}
          >
            <Box component="span">Fair</Box>
            <Box
              component="span"
              sx={{
                color: '#c9a227',
                fontWeight: 800,
                mx: 0.25,
              }}
            >
              $
            </Box>
            <Box component="span">hare</Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 320,
              mx: 'auto',
              fontSize: '1.05rem',
            }}
          >
            {subtitle}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              mt: 3,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Typography
              component="span"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 700,
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              $
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Split bills · Track spends · Stay even
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: { md: '1 1 55%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4 },
          bgcolor: 'background.default',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 440,
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
