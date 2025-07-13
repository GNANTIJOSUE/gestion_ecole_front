import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Divider,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Event,
  Assessment,
  Assignment,
  ExitToApp,
  School,
  LibraryBooks,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 250;

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/secretary/dashboard' },
  { text: 'Étudiants', icon: <PeopleIcon />, path: '/secretary/students' },
  { text: 'Gestion des élèves', icon: <GroupIcon />, path: '/secretary/gestion-eleves' },
  { text: 'Inscription Professeur', icon: <PersonAddIcon />, path: '/secretary/teachers' },
  { text: 'Classes', icon: <ClassIcon />, path: '/secretary/classes' },
  { text: 'Matières', icon: <LibraryBooks />, path: '/secretary/subjects' },
  { text: 'Gestion des emplois du temps', icon: <Assignment />, path: '/secretary/timetables' },
  { text: 'Gestion des bulletins', icon: <Assessment />, path: '/secretary/report-cards' },
  { text: 'Événements', icon: <Event />, path: '/secretary/events' },
  { text: 'Paiements', icon: <PaymentIcon />, path: '/secretary/payments' },
  { text: 'Bons et Prises en Charge', icon: <LocalOfferIcon />, path: '/secretary/discounts' },
  { text: 'Paramètres', icon: <SettingsIcon />, path: '/secretary/settings' },
  { text: 'Gérer les rôles', icon: <SettingsIcon />, path: '/secretary/roles' },
];

const SecretarySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'linear-gradient(135deg, #1976d2 60%, #512da8 100%)',
          color: 'white',
          borderRight: 'none',
          boxShadow: 4,
          background: 'linear-gradient(135deg, #1976d2 60%, #512da8 100%)',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.06)' }}>
        <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          Admin
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: '#1976d2',
                  fontWeight: 700,
                  '& .MuiListItemIcon-root': {
                    color: '#1976d2',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.10)',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40, fontSize: 24 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500, fontSize: 17 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/')}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.10)',
              },
              transition: 'all 0.2s',
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontWeight: 500, fontSize: 17 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SecretarySidebar; 