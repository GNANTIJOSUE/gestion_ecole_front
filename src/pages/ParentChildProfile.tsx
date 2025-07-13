import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Button, Grid, Typography, IconButton, Badge, Menu, MenuItem, ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, TextField, useTheme, useMediaQuery, Chip, FormControl, InputLabel, Select } from '@mui/material';
import NotesTab from './NotesTab';
import ReportCardTab from './ReportCardTab';
import AbsencesTab from './AbsencesTab';
import ScheduleTab from './ScheduleTab';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const tabOptions = [
  {
    label: 'Remarques',
    color: '#1976d2',
    icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
  },
  {
    label: 'Bulletin',
    color: '#e040fb',
    icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
  },
  {
    label: 'Absences',
    color: '#ff9800',
    icon: <EventBusyIcon sx={{ fontSize: 40 }} />,
  },
  {
    label: 'Emploi du temps',
    color: '#43a047',
    icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
  },
];

const PaiementDialog = ({ open, onClose, childId, schoolYear }: { open: boolean, onClose: () => void, childId: string | undefined, schoolYear: string }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [fusionAccount, setFusionAccount] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);
  const [fusionAccounts, setFusionAccounts] = useState<{ [key: number]: string }>({});
  const [receipt, setReceipt] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [customAmount, setCustomAmount] = useState('');

  React.useEffect(() => {
    if (!open || !childId || !schoolYear) return;
    setLoading(true);
    setError(null);
    setReceipt(null);
    setShowReceipt(false);
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [paymentsRes, studentRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/students/${childId}/payments?school_year=${schoolYear}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/api/students/${childId}?school_year=${schoolYear}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setPayments(paymentsRes.data);
        setStudent(studentRes.data);
      } catch (e: any) {
        setError("Erreur lors du chargement des paiements.");
      }
      setLoading(false);
    };
    fetchData();
  }, [open, childId, schoolYear]);

  // Correction : toujours utiliser les valeurs du backend pour l'affichage global
  const totalDue = student?.class_amount ?? student?.total_due ?? 0;
  const totalDiscount = student?.total_discount ?? 0;
  const totalPaid = student?.total_paid ?? 0;
  const reste = student?.reste_a_payer ?? Math.max(0, totalDue - totalDiscount - totalPaid);

  // Paiement individuel d'une ligne en attente
  const handleFusionPaySingle = async (payment: any) => {
    setPayingId(payment.id);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/payments', {
        student_id: childId,
        amount: payment.amount,
        monnaie_fusion_account: fusionAccounts[payment.id] || '',
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.fusion && res.data.fusion.url) {
        window.open(res.data.fusion.url, '_blank');
        // Simuler la réception du reçu (à remplacer par un vrai fetch reçu après paiement effectif)
        setReceipt({
          payment_date: payment.payment_date,
          amount: payment.amount,
          status: 'en attente',
          id: payment.id,
          student_name: student ? `${student.first_name} ${student.last_name}` : '',
        });
        setShowReceipt(true);
      } else {
        setError("Erreur lors de l'initiation du paiement Monnaie Fusion.");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors du paiement.");
    }
    setPayingId(null);
  };

  // Paiement du reste à payer (global)
  const handleFusionPay = async () => {
    setPaying(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const amountToPay = Number(customAmount);
      const res = await axios.post('http://localhost:5000/api/payments', {
        student_id: childId,
        amount: amountToPay,
        monnaie_fusion_account: fusionAccount
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.fusion && res.data.fusion.url) {
        window.open(res.data.fusion.url, '_blank');
        setReceipt({
          payment_date: new Date().toISOString(),
          amount: amountToPay,
          status: 'en attente',
          id: 'reste',
          student_name: student ? `${student.first_name} ${student.last_name}` : '',
        });
        setShowReceipt(true);
      } else {
        setError("Erreur lors de l'initiation du paiement Monnaie Fusion.");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors du paiement.");
    }
    setPaying(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 700, fontSize: { xs: 18, sm: 22 } }}>Paiements de l'enfant</DialogTitle>
      <DialogContent sx={{ px: { xs: 1, sm: 3 }, py: { xs: 1, sm: 2 } }}>
        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
          <>
            <Box mb={2}>
              <Typography variant="subtitle1" mb={1} fontSize={{ xs: 15, sm: 18 }}>
                <b>Montant total de la scolarité :</b> <span style={{ color: '#1976d2', fontWeight: 700 }}>{totalDue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span><br />
                {totalDiscount > 0 && (
                  <>
                    <b>Réduction :</b> <span style={{ color: '#1976d2', fontWeight: 700 }}>- {totalDiscount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span><br />
                  </>
                )}
                <b>Total payé :</b> <span style={{ color: '#388e3c', fontWeight: 700 }}>{totalPaid.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span><br />
                <b>Reste à payer :</b> <span style={{ color: reste > 0 ? '#d32f2f' : '#388e3c', fontWeight: 700 }}>{reste.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
              </Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ mb: 2, borderRadius: 2, boxShadow: 2, minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Heure</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p, idx) => {
                    const dateObj = new Date(p.payment_date);
                    const isPending = p.status === 'en attente' || p.status === 'pending';
                    return (
                      <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? '#f8fafd' : '#fff' }}>
                        <TableCell>{dateObj.toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{dateObj.toLocaleTimeString('fr-FR')}</TableCell>
                        <TableCell>{Number(p.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</TableCell>
                        <TableCell>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: 12,
                            fontWeight: 600,
                            color: isPending ? '#d32f2f' : '#388e3c',
                            background: isPending ? '#fff3e0' : '#e8f5e9',
                            fontSize: 14
                          }}>{p.status}</span>
                        </TableCell>
                        <TableCell align="center">
                          {isPending && (
                            <Box display={{ xs: 'block', sm: 'flex' }} alignItems="center" gap={1}>
                              <TextField
                                size="small"
                                label="Compte Monnaie Fusion"
                                value={fusionAccounts[p.id] || ''}
                                onChange={e => setFusionAccounts({ ...fusionAccounts, [p.id]: e.target.value })}
                                sx={{ width: { xs: '100%', sm: 170 }, mb: { xs: 1, sm: 0 } }}
                              />
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<PaymentIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                                disabled={payingId === p.id || !(fusionAccounts[p.id] && fusionAccounts[p.id].length > 0)}
                                onClick={() => handleFusionPaySingle(p)}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                              >
                                Payer
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {payments.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">Aucun paiement trouvé.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            {reste > 0 && (
              <Box
                mt={2}
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                alignItems="center"
                justifyContent="center"
                gap={2}
                sx={{ width: '100%' }}
              >
                <TextField
                  label="Montant à payer"
                  type="number"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value.replace(/^0+/, ''))}
                  size="small"
                  sx={{
                    width: { xs: '100%', sm: 170 },
                    bgcolor: '#fff',
                    borderRadius: 2,
                    boxShadow: 1,
                    '& .MuiInputBase-root': { borderRadius: 2 },
                  }}
                  inputProps={{ min: 1, max: reste }}
                  helperText={`Maximum : ${reste.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}`}
                />
                <TextField
                  label="Compte Monnaie Fusion (téléphone)"
                  value={fusionAccount}
                  onChange={e => setFusionAccount(e.target.value)}
                  size="small"
                  sx={{
                    width: { xs: '100%', sm: 220 },
                    bgcolor: '#fff',
                    borderRadius: 2,
                    boxShadow: 1,
                    '& .MuiInputBase-root': { borderRadius: 2 },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<PaymentIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />}
                  disabled={
                    paying ||
                    !fusionAccount ||
                    !customAmount ||
                    isNaN(Number(customAmount)) ||
                    Number(customAmount) <= 0 ||
                    Number(customAmount) > reste
                  }
                  onClick={handleFusionPay}
                  sx={{
                    width: { xs: '100%', sm: 200 },
                    fontSize: { xs: 16, sm: 20 },
                    py: { xs: 1.2, sm: 2 },
                    px: { xs: 0, sm: 4 },
                    fontWeight: 900,
                    borderRadius: 2,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    boxShadow: 3,
                    bgcolor: !paying && fusionAccount && customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0 && Number(customAmount) <= reste ? '#43a047' : '#e0e0e0',
                    color: !paying && fusionAccount && customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0 && Number(customAmount) <= reste ? '#fff' : '#888',
                    transition: 'background 0.2s, color 0.2s',
                    '&:hover': {
                      bgcolor: !paying && fusionAccount && customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0 && Number(customAmount) <= reste ? '#388e3c' : '#e0e0e0',
                      color: !paying && fusionAccount && customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0 && Number(customAmount) <= reste ? '#fff' : '#888',
                    },
                  }}
                >
                  Payer {customAmount ? Number(customAmount).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) : ''}
                </Button>
              </Box>
            )}
            {reste === 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>La scolarité est totalement réglée.</Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ fontSize: { xs: 15, sm: 16 } }}>Fermer</Button>
      </DialogActions>
      {/* Dialogue reçu */}
      <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} fullScreen={isMobile}>
        <DialogTitle>Reçu de paiement</DialogTitle>
        <DialogContent>
          {receipt && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>Paiement #{receipt.id}</Typography>
              <Typography>Élève : <b>{receipt.student_name}</b></Typography>
              <Typography>Date : <b>{new Date(receipt.payment_date).toLocaleDateString('fr-FR')} {new Date(receipt.payment_date).toLocaleTimeString('fr-FR')}</b></Typography>
              <Typography>Montant : <b>{Number(receipt.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</b></Typography>
              <Typography>Statut : <b>{receipt.status}</b></Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceipt(false)} sx={{ fontSize: { xs: 15, sm: 16 } }}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

function getCurrentSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

function getSchoolYears(count = 5) {
  const current = getCurrentSchoolYear();
  const startYear = parseInt(current.split('-')[0], 10);
  return Array.from({ length: count }, (_, i) => {
    const start = startYear - i;
    return `${start}-${start + 1}`;
  });
}

const ParentChildProfile = () => {
  const { childId } = useParams();
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  // Notifications d'absence pour l'enfant courant
  const [absenceNotifications, setAbsenceNotifications] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setAnchorEl(null);
  };

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/events/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mettre à jour l'état local
      setAbsenceNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: 1 } : n
      ));
      setNotifCount(prev => Math.max(0, absenceNotifications.filter(n => !n.is_read && n.id !== notificationId).length));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/events/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mettre à jour l'état local
      setAbsenceNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setNotifCount(0);
      // Fermer le menu après le marquage
      setAnchorEl(null);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchAbsenceNotifications = async () => {
      if (!childId) return;
      const token = localStorage.getItem('token');
      try {
        const { data } = await axios.get('http://localhost:5000/api/events/my-notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const absNotifs = data.filter(
          (n: any) =>
            n.title &&
            n.title.startsWith('Absence de') &&
            (n.student_id === Number(childId) || (n.message && n.message.includes(childId)))
        );
        setAbsenceNotifications(absNotifs);
        setNotifCount(absNotifs.filter((n: any) => !n.is_read).length);
      } catch (e) {
        setAbsenceNotifications([]);
        setNotifCount(0);
      }
    };
    fetchAbsenceNotifications();
    interval = setInterval(fetchAbsenceNotifications, 10000); // toutes les 10s
    return () => clearInterval(interval);
  }, [childId]);

  // Dialogue paiement
  const [openPaiement, setOpenPaiement] = useState(false);
  const handlePayment = () => setOpenPaiement(true);
  const handleClosePaiement = () => setOpenPaiement(false);

  // Ajout pour la moyenne annuelle
  const [annualAverage, setAnnualAverage] = useState<{ moyenne_annuelle: number, rank: number, total: number } | null>(null);
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const SCHOOL_YEARS = getSchoolYears(5);
  const [publishedTrimesters, setPublishedTrimesters] = useState<{ [key: string]: boolean }>({});
  const [studentClassId, setStudentClassId] = useState<number | null>(null);

  React.useEffect(() => {
    if (!childId) return;
    const fetchAnnualAverage = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:5000/api/students/${childId}/annual-average?school_year=${schoolYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnualAverage(data);
      } catch {
        setAnnualAverage(null);
      }
    };
    fetchAnnualAverage();
  }, [childId, schoolYear]);

  // Récupérer la classe de l'élève pour l'année scolaire sélectionnée
  React.useEffect(() => {
    if (!childId) return;
    const fetchClassId = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:5000/api/students/${childId}?school_year=${schoolYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudentClassId(data.class_id);
      } catch {
        setStudentClassId(null);
      }
    };
    fetchClassId();
  }, [childId, schoolYear]);

  // Récupérer l'état de publication des bulletins pour chaque trimestre
  React.useEffect(() => {
    if (!studentClassId) return;
    const fetchPublished = async () => {
      const trimesters = ['1er trimestre', '2e trimestre', '3e trimestre'];
      const token = localStorage.getItem('token');
      const results: { [key: string]: boolean } = {};
      await Promise.all(trimesters.map(async (trimester) => {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/report-cards/published?class_id=${studentClassId}&trimester=${encodeURIComponent(trimester)}&school_year=${schoolYear}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          results[trimester] = !!data.published;
        } catch {
          results[trimester] = false;
        }
      }));
      setPublishedTrimesters(results);
    };
    fetchPublished();
  }, [studentClassId, schoolYear]);

  // Bloc moyenne annuelle stylisé : affiché seulement si les 3 bulletins sont publiés
  console.log('DEBUG annualAverage:', annualAverage);
  console.log('DEBUG publishedTrimesters:', publishedTrimesters);
  const allTrimestersPublished = publishedTrimesters['1er trimestre'] && publishedTrimesters['2e trimestre'] && publishedTrimesters['3e trimestre'];

  return (
    <Box sx={{ p: 4 }}>
      {/* Bouton retour */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, fontWeight: 700, fontSize: 16, borderRadius: 3, px: 3 }}
        onClick={() => navigate('/parent/dashboard')}
      >
        Retour au tableau de bord parent
      </Button>
      <Box display="flex" alignItems="center" justifyContent="flex-end" mb={2}>
        <IconButton color="primary" sx={{ ml: 2 }} onClick={handleNotifClick}>
          <Badge badgeContent={notifCount} color="error">
            <NotificationsIcon sx={{ fontSize: 32 }} />
          </Badge>
        </IconButton>
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
              Notifications d'absence
            </Typography>
            {absenceNotifications.length > 0 && (
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
          {absenceNotifications.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="Aucune notification d'absence" />
            </MenuItem>
          ) : (
            <>
              {absenceNotifications.map((notif: any, i: number) => (
                <MenuItem 
                  key={i} 
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    handleNotifClose();
                  }} 
                  sx={{ 
                    alignItems: 'flex-start',
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
                    </span>}
                    secondary={notif.message}
                    primaryTypographyProps={{ fontSize: 15 }}
                    secondaryTypographyProps={{ fontSize: 13, color: 'text.secondary' }}
                  />
                </MenuItem>
              ))}
              <MenuItem disabled sx={{ borderTop: '1px solid #e0e0e0', mt: 1 }}>
                <ListItemText 
                  primary="Affiche les 10 notifications les plus récentes" 
                  primaryTypographyProps={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic' }}
                />
              </MenuItem>
            </>
          )}
        </Menu>
      </Box>
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
      {(annualAverage && annualAverage.moyenne_annuelle !== null && allTrimestersPublished) ? (
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #b2ebf2 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            textAlign: 'center',
            mt: 1,
            mb: 4,
            maxWidth: 600,
            mx: 'auto',
            transition: 'box-shadow 0.3s',
            '&:hover': {
              boxShadow: '0 16px 40px 0 rgba(31, 38, 135, 0.25)',
            },
          }}
        >
          <BarChartIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
          <Typography variant="h5" fontWeight={700} color="primary.main" mb={1}>
            Moyenne annuelle
          </Typography>
          <Typography variant="h2" fontWeight={900} color="#1976d2" mb={1}>
            {annualAverage!.moyenne_annuelle.toFixed(2)}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={1}>
            Rang dans la classe : <b>{annualAverage!.rank} / {annualAverage!.total}</b>
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={1}>
            {annualAverage!.moyenne_annuelle >= 10 ? (
              <Chip label="Admis en classe supérieure" color="success" icon={<StarIcon />} sx={{ fontWeight: 700, fontSize: 16 }} />
            ) : (
              <Chip label="Non admis" color="error" icon={<StarIcon />} sx={{ fontWeight: 700, fontSize: 16 }} />
            )}
          </Box>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ p: 3, borderRadius: '16px', background: '#fff', textAlign: 'center', boxShadow: '0 2px 8px #1976d2', mb: 4, maxWidth: 600, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <InfoIcon sx={{ color: '#1976d2', fontSize: 36 }} />
          <Typography variant="h6" color="#1976d2" sx={{ textAlign: 'left' }}>
            La moyenne annuelle de votre enfant sera affichée ici<br />
            <b>dès que les bulletins des trois trimestres auront été publiés par l'administration.</b><br />
            <span style={{ fontWeight: 400, fontSize: 15 }}>Merci de votre compréhension.</span>
          </Typography>
        </Paper>
      )}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 4, boxShadow: 4 }}>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {tabOptions.map((opt, idx) => (
            <Grid item key={opt.label} xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant={tab === idx ? 'contained' : 'outlined'}
                onClick={() => setTab(idx)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 120,
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: 20,
                  color: tab === idx ? 'white' : opt.color,
                  background: tab === idx ? opt.color : 'white',
                  borderColor: opt.color,
                  boxShadow: tab === idx ? 6 : 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: opt.color,
                    color: 'white',
                    boxShadow: 8,
                  },
                  mb: 1,
                }}
                startIcon={opt.icon}
              >
                {opt.label}
              </Button>
            </Grid>
          ))}
        </Grid>
        {/* Bouton Paiement */}
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<PaymentIcon sx={{ fontSize: 32 }} />}
            sx={{
              px: 6,
              py: 2,
              fontWeight: 700,
              fontSize: 22,
              borderRadius: 3,
              boxShadow: 3,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
            onClick={handlePayment}
          >
            Paiement
          </Button>
        </Box>
      </Paper>
      <PaiementDialog open={openPaiement} onClose={handleClosePaiement} childId={childId} schoolYear={schoolYear} />
      {tab === 0 && <NotesTab childId={childId} schoolYear={schoolYear} />}
      {tab === 1 && <ReportCardTab childId={childId} schoolYear={schoolYear} />}
      {tab === 2 && <AbsencesTab childId={childId} schoolYear={schoolYear} />}
      {tab === 3 && <ScheduleTab childId={childId} schoolYear={schoolYear} />}
    </Box>
  );
};

export default ParentChildProfile; 