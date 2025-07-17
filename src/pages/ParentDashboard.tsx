import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton, Badge, Menu, MenuItem, ListItemText, ListItemIcon, Paper, Stack, FormControl, InputLabel, Select } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LogoutIcon from '@mui/icons-material/Logout';

const ParentDashboard = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);

  // Pour le menu déroulant
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setAnchorEl(null);
  };

  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const handleNotifDetail = (notif: any) => {
    setSelectedNotif(notif);
    setOpenDialog(true);
    handleNotifClose();
    // Marquer la notification comme lue
    markNotificationAsRead(notif.id);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedNotif(null);
  };

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://schoolapp.sp-p6.com/api/events/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: 1 } : n
      ));
      setNotifCount(prev => Math.max(0, notifications.filter(n => !n.is_read && n.id !== notificationId).length));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://schoolapp.sp-p6.com/api/events/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setNotifCount(0);
      // Fermer le menu après le marquage
      setAnchorEl(null);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    if (month >= 9) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };
  const getSchoolYears = (count = 5) => {
    const current = getCurrentSchoolYear();
    const startYear = parseInt(current.split('-')[0], 10);
    return Array.from({ length: count }, (_, i) => {
      const start = startYear - i;
      return `${start}-${start + 1}`;
    });
  };

  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const SCHOOL_YEARS = getSchoolYears(5);
  const [parent, setParent] = useState<any>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const parent_code = user.parent_code;
      if (!parent_code) {
        setChildren([]);
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(`http://schoolapp.sp-p6.com/api/students?parent_code=${parent_code}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChildren(data);
      } catch (e) {
        setChildren([]);
      }
      setLoading(false);
    };
    fetchChildren();

    // Récupère les notifications réelles (tous types)
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await axios.get('http://schoolapp.sp-p6.com/api/events/my-notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[FRONT][ParentDashboard] Notifications reçues:', data);
        setNotifications(data);
        setNotifCount(data.filter((n: any) => !n.is_read).length);
      } catch (e) {
        setNotifications([]);
        setNotifCount(0);
      }
    };
    fetchNotifications();

    const fetchParent = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await axios.get(`http://schoolapp.sp-p6.com/api/parents/me?school_year=${schoolYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParent(data);
      } catch {
        setParent(null);
      }
    };
    fetchParent();
  }, [schoolYear]);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) return <CircularProgress />;
  if (!children.length) return <Typography>Aucun enfant trouvé pour ce compte parent.</Typography>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', p: { xs: 1, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel id="school-year-label">Année scolaire</InputLabel>
          <Select
            labelId="school-year-label"
            value={schoolYear}
            label="Année scolaire"
            onChange={e => setSchoolYear(e.target.value)}
          >
            {SCHOOL_YEARS.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Paper elevation={4} sx={{ maxWidth: 700, width: '100%', minHeight: 480, mx: 'auto', p: { xs: 5, sm: 6 }, borderRadius: 6, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)', mt: 8, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Ligne titre + actions */}
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mb={3}>
          <Typography variant="h3" fontWeight={900} color="primary.main" gutterBottom sx={{ fontSize: { xs: 24, sm: 32 }, m: 0 }}>
            Bienvenue sur le tableau de bord parent !
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton color="primary" sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 2 }} onClick={handleNotifClick}>
              <Badge badgeContent={notifCount} color="error">
                <NotificationsIcon sx={{ fontSize: 30 }} />
              </Badge>
            </IconButton>
            <IconButton color="error" sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 2 }} onClick={handleLogout} title="Se déconnecter">
              <LogoutIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mb: 3, fontSize: 18, color: '#333', textAlign: 'center' }}>
          Cliquez sur le nom de votre enfant pour consulter ses informations :
        </Typography>
        <Stack direction="column" spacing={3} alignItems="center" mt={2} width="100%">
          {children.map(child => (
            <Button
              key={child.id}
              variant="contained"
              sx={{
                width: '100%',
                maxWidth: 320,
                py: 2,
                fontSize: 22,
                fontWeight: 800,
                borderRadius: 4,
                background: 'linear-gradient(90deg, #1976d2 60%, #f06292 100%)',
                color: 'white',
                boxShadow: 4,
                letterSpacing: 1,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                mb: 1,
                '&:hover': {
                  background: 'linear-gradient(90deg, #f06292 60%, #1976d2 100%)',
                  boxShadow: 8,
                  transform: 'scale(1.04)',
                },
              }}
              onClick={() => navigate(`/parent/child/${child.id}`)}
            >
              {child.first_name} {child.last_name}
            </Button>
          ))}
        </Stack>
        {/* Menu notifications */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 320, borderRadius: 3, boxShadow: 4 } }}
        >
          <Box sx={{ px: 2, pt: 1, pb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary.main" fontWeight={700}>
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllNotificationsAsRead();
                }}
                sx={{ fontSize: 12, py: 0.5 }}
              >
                Tout marquer comme lu
              </Button>
            )}
          </Box>
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="Aucune notification" />
            </MenuItem>
          ) : (
            <>
              {notifications.map((notif: any, i: number) => {
                // Recherche du prénom/nom de l'enfant concerné si possible
                let enfant = null;
                if (notif.type === 'private' && notif.message && children.length > 0) {
                  // On tente d'extraire le prénom/nom de l'enfant depuis le message ou le titre
                  const found = children.find(child =>
                    notif.message.includes(child.first_name) || notif.title.includes(child.first_name)
                  );
                  if (found) enfant = `${found.first_name} ${found.last_name}`;
                }
                return (
                  <MenuItem 
                    key={i} 
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      handleNotifDetail(notif);
                    }} 
                    sx={{ 
                      alignItems: 'flex-start', 
                      cursor: 'pointer',
                      backgroundColor: notif.is_read ? 'transparent' : '#f0f8ff',
                      '&:hover': {
                        backgroundColor: notif.is_read ? '#f5f5f5' : '#e3f2fd'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ mt: 0.5 }}>
                      {notif.type === 'public' && <InfoIcon color="primary" />}
                      {notif.type === 'private' && <EventBusyIcon color="warning" />}
                      {notif.type === 'class' && <CheckCircleIcon color="success" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={<span>
                        {notif.title}
                        {!notif.is_read && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: 10,
                            backgroundColor: '#ff4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}>
                            N
                          </span>
                        )}
                        <span style={{
                          marginLeft: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            notif.type === 'public' ? '#1976d2' :
                            notif.type === 'private' ? '#ff9800' :
                            '#43a047',
                          border: '1px solid',
                          borderColor:
                            notif.type === 'public' ? '#1976d2' :
                            notif.type === 'private' ? '#ff9800' :
                            '#43a047',
                          borderRadius: 8,
                          padding: '2px 8px',
                          background:
                            notif.type === 'public' ? '#e3f2fd' :
                            notif.type === 'private' ? '#fff3e0' :
                            '#e8f5e9',
                        }}>
                          {notif.type === 'public' && 'Public'}
                          {notif.type === 'private' && 'Privé'}
                          {notif.type === 'class' && 'Classe'}
                        </span>
                        {enfant && (
                          <span style={{ marginLeft: 8, fontSize: 12, color: '#1976d2', fontWeight: 500 }}>
                            (Enfant : {enfant})
                          </span>
                        )}
                      </span>}
                      secondary={notif.message}
                      primaryTypographyProps={{ fontSize: 15 }}
                      secondaryTypographyProps={{ fontSize: 13, color: 'text.secondary' }}
                    />
                  </MenuItem>
                );
              })}
              <MenuItem disabled sx={{ borderTop: '1px solid #e0e0e0', mt: 1 }}>
                <ListItemText 
                  primary="Affiche les 10 notifications les plus récentes" 
                  primaryTypographyProps={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic' }}
                />
              </MenuItem>
            </>
          )}
        </Menu>
        {/* Dialog de détail notification sécurisé */}
        <Dialog open={!!selectedNotif} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          {selectedNotif && (
            <>
              <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>{selectedNotif.title}</DialogTitle>
              <DialogContent>
                <Box mb={2}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color:
                      selectedNotif.type === 'public' ? '#1976d2' :
                      selectedNotif.type === 'private' ? '#ff9800' :
                      '#43a047',
                    border: '1px solid',
                    borderColor:
                      selectedNotif.type === 'public' ? '#1976d2' :
                      selectedNotif.type === 'private' ? '#ff9800' :
                      '#43a047',
                    borderRadius: 8,
                    padding: '2px 10px',
                    background:
                      selectedNotif.type === 'public' ? '#e3f2fd' :
                      selectedNotif.type === 'private' ? '#fff3e0' :
                      '#e8f5e9',
                  }}>
                    {selectedNotif.type === 'public' && 'Public'}
                    {selectedNotif.type === 'private' && 'Privé'}
                    {selectedNotif.type === 'class' && 'Classe'}
                  </span>
                  {/* Affiche l'enfant concerné si possible */}
                  {selectedNotif.type === 'private' && children.length > 0 && (() => {
                    const found = children.find(child =>
                      (selectedNotif.message && selectedNotif.message.includes(child.first_name)) ||
                      (selectedNotif.title && selectedNotif.title.includes(child.first_name))
                    );
                    return found ? (
                      <span style={{ marginLeft: 12, fontSize: 13, color: '#1976d2', fontWeight: 500 }}>
                        (Enfant : {found.first_name} {found.last_name})
                      </span>
                    ) : null;
                  })()}
                </Box>
                <Typography variant="body1" mb={2}>{selectedNotif.message}</Typography>
                {selectedNotif.event_date && (
                  <Typography variant="body2" color="text.secondary">
                    Date de l'événement : {new Date(selectedNotif.event_date).toLocaleString('fr-FR')}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} color="primary" variant="contained">Fermer</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        {parent && (
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 3, background: '#f9f9f9' }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">Informations du parent ({schoolYear})</Typography>
            <Typography><b>Nom :</b> {parent.last_name} {parent.first_name}</Typography>
            <Typography><b>Email :</b> {parent.email}</Typography>
            <Typography><b>Téléphone :</b> {parent.phone}</Typography>
            {/* Ajoute d'autres infos si besoin */}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ParentDashboard; 