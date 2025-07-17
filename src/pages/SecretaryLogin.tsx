import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { blue, green, purple } from '@mui/material/colors';
import axios from 'axios';

const SecretaryLogin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'success',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await axios.post('http://schoolapp.sp-p6.com/api/auth/login', {
        email: formData.email,
        password: formData.password,
        role: 'secretary'
      });

      if (response.data.status === 'success') {
        // Stocker le token dans le localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        setSnackbar({
          open: true,
          message: 'Connexion réussie !',
          severity: 'success',
        });

        setTimeout(() => {
          navigate('/secretary/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de la connexion',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${purple[50]} 0%, ${blue[50]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 5,
            borderRadius: 4,
            boxShadow: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${purple[100]})`,
              borderRadius: '50%',
              opacity: 0.2,
              zIndex: 0,
            }}
          />
          <AdminPanelSettingsIcon sx={{ fontSize: 56, color: theme.palette.secondary.main, mb: 2, zIndex: 1 }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              zIndex: 1,
            }}
          >
            Connexion Secrétariat
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4, zIndex: 1 }}
          >
            Accédez à votre espace secrétariat
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', zIndex: 1 }}>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: purple[50],
                  '&:hover fieldset': {
                    borderColor: theme.palette.secondary.main,
                  },
                },
              }}
            />
            <TextField
              required
              fullWidth
              label="Mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: theme.palette.secondary.main }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: blue[50],
                  '&:hover fieldset': {
                    borderColor: theme.palette.secondary.main,
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                fontWeight: 700,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.palette.secondary.main} 60%, ${purple[400]} 100%)`,
                boxShadow: 3,
                letterSpacing: 1,
                fontSize: 18,
                '&:hover': {
                  background: `linear-gradient(90deg, ${theme.palette.secondary.dark} 60%, ${purple[700]} 100%)`,
                },
              }}
            >
              Se connecter
            </Button>
          </Box>
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={undefined}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              boxShadow: 3,
              fontWeight: 600,
              fontSize: 16,
              '& .MuiAlert-icon': {
                fontSize: 24,
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default SecretaryLogin; 