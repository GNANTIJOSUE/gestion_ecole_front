import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import SecretarySidebar from '../../components/SecretarySidebar';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    autoSave: true,
    darkMode: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked,
    });
  };

  const handleSave = () => {
    // Simulation de sauvegarde
    setSnackbar({
      open: true,
      message: 'Paramètres sauvegardés avec succès',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SecretarySidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            Paramètres
          </Typography>

          <Grid container spacing={3}>
            {/* Paramètres généraux */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Paramètres généraux
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Notifications"
                      secondary="Recevoir des notifications sur le tableau de bord"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications}
                        onChange={handleSettingChange('notifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Notifications par email"
                      secondary="Recevoir des notifications par email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.emailNotifications}
                        onChange={handleSettingChange('emailNotifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Sauvegarde automatique"
                      secondary="Sauvegarder automatiquement les modifications"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.autoSave}
                        onChange={handleSettingChange('autoSave')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Mode sombre"
                      secondary="Activer le thème sombre"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.darkMode}
                        onChange={handleSettingChange('darkMode')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Paramètres du compte */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Paramètres du compte
                </Typography>
                <Box component="form" sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    defaultValue="secretaire"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue="secretaire@college-excellence.fr"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Nouveau mot de passe"
                    type="password"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Confirmer le mot de passe"
                    type="password"
                    margin="normal"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ mt: 2 }}
                  >
                    Sauvegarder les modifications
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            TransitionComponent={undefined}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default Settings; 