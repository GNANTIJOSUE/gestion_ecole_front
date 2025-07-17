import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Chip,
  Avatar,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon, School as SchoolIcon, Payments as PaymentsIcon, Print as PrintIcon, LocalOffer as LocalOfferIcon } from '@mui/icons-material';
import SecretarySidebar from '../../components/SecretarySidebar';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStudentDetails = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [studentData, discountsData] = await Promise.all([
          axios.get(`http://schoolapp.sp-p6.com/api/students/${id}/details`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://schoolapp.sp-p6.com/api/discounts/student/${id}`)
        ]);
        if (isMounted) {
          setStudent(studentData.data);
          setDiscounts(discountsData.data);
        }
      } catch (err: any) {
        if (isMounted) setError(err.response?.data?.message || "Erreur lors de la récupération des détails de l'étudiant.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchStudentDetails();
    }
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };
  
  const DetailItem = ({ label, value, icon }: { label: string; value: any; icon?: React.ReactElement }) => (
    <Grid item xs={12} sm={6} md={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
            {icon && <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>{icon}</Avatar>}
            <Box>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{value || 'N/A'}</Typography>
            </Box>
        </Box>
    </Grid>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      <SecretarySidebar />
      <Container maxWidth="lg" sx={{ p: 3, '@media print': { p: 0 } }}>
        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 3, '@media print': { boxShadow: 'none', p: 2 } }}>
          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          {student && (
            <>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: `2px solid ${theme.palette.primary.main}`, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mr: 2, fontSize: '2rem' }}>
                        {student.first_name?.[0]}{student.last_name?.[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                            {student.first_name} {student.last_name}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                           Matricule: {student.registration_number || 'Non défini'}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, '@media print': { display: 'none' } }}>
                  <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Retour
                  </Button>
                   <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                    Imprimer
                  </Button>
                </Box>
              </Box>

              {/* Personal Info */}
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <PersonIcon /> Informations Personnelles
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <DetailItem label="Date de naissance" value={student.date_of_birth ? format(new Date(student.date_of_birth), 'dd MMMM yyyy', { locale: fr }) : 'N/A'} />
                    <DetailItem label="Genre" value={student.gender} />
                    <DetailItem label="Adresse" value={student.address} />
                    <DetailItem label="Ville" value={student.city} />
                    <DetailItem label="Téléphone" value={student.phone} />
                    <DetailItem label="Email" value={student.email} />
                  </Grid>
                </CardContent>
              </Card>

              {/* Academic Info */}
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <SchoolIcon /> Informations Académiques
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <DetailItem label="Classe actuelle" value={<Chip label={student.classe_name || 'Non assigné'} color="primary" />} />
                    <DetailItem label="École précédente" value={student.previous_school} />
                    <DetailItem label="Classe précédente" value={student.previous_class} />
                    <DetailItem label="Code Étudiant" value={<Chip label={student.student_code || 'N/A'} color="secondary" variant="outlined" />} />
                    <DetailItem label="Code Parent" value={<Chip label={student.parent_code || 'N/A'} color="secondary" variant="outlined" />} />
                  </Grid>
                </CardContent>
              </Card>

              {/* Financial Info */}
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <PaymentsIcon /> Informations Financières
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                   <Grid container spacing={3} sx={{ my: 2 }}>
                        <Grid item xs={12} sm={4}>
                           <Paper sx={{p: 2, textAlign: 'center', background: 'linear-gradient(45deg, #e3f2fd, #bbdefb)'}}>
                                <Typography variant="h6">Total à Payer</Typography>
                                <Typography variant="h5" sx={{fontWeight: 'bold'}}>{(student.total_due || 0).toLocaleString('fr-FR')} F CFA</Typography>
                           </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{p: 2, textAlign: 'center', background: 'linear-gradient(45deg, #e8f5e9, #c8e6c9)'}}>
                                <Typography variant="h6">Total Payé</Typography>
                                <Typography variant="h5" sx={{fontWeight: 'bold', color: 'success.dark'}}>{(student.total_paid || 0).toLocaleString('fr-FR')} F CFA</Typography>
                           </Paper>
                        </Grid>
                         <Grid item xs={12} sm={4}>
                            <Paper sx={{p: 2, textAlign: 'center', background: 'linear-gradient(45deg, #ffebee, #ffcdd2)'}}>
                                <Typography variant="h6">Solde Restant</Typography>
                                <Typography variant="h5" sx={{fontWeight: 'bold', color: 'error.dark'}}>{((student.total_due || 0) - (student.total_paid || 0)).toLocaleString('fr-FR')} F CFA</Typography>
                           </Paper>
                        </Grid>
                    </Grid>

                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>Historique des paiements</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{backgroundColor: 'grey.200'}}>
                          <TableCell sx={{fontWeight: 'bold'}}>Date</TableCell>
                          <TableCell sx={{fontWeight: 'bold'}} align="right">Montant</TableCell>
                          <TableCell sx={{fontWeight: 'bold'}}>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {student.payments && student.payments.length > 0 ? (
                          student.payments.map((p: any) => (
                            <TableRow key={p.id}>
                              <TableCell>{format(new Date(p.payment_date), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                              <TableCell align="right">{p.amount.toLocaleString('fr-FR')} F CFA</TableCell>
                              <TableCell>
                                <Chip label={p.status} color={p.status === 'completed' || p.status === 'paid' ? 'success' : 'warning'} size="small" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center">Aucun paiement enregistré</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Discounts Section */}
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <LocalOfferIcon /> Bons et Prises en Charge
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  
                  {discounts.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{backgroundColor: 'grey.200'}}>
                            <TableCell sx={{fontWeight: 'bold'}}>Type</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}} align="right">Montant</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}} align="right">Pourcentage</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Raison</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Statut</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Date d'approbation</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {discounts.map((discount: any) => (
                            <TableRow key={discount.id}>
                              <TableCell>{discount.discount_type_name}</TableCell>
                              <TableCell align="right">{discount.amount.toLocaleString('fr-FR')} F CFA</TableCell>
                              <TableCell align="right">{discount.percentage}%</TableCell>
                              <TableCell>{discount.reason}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={discount.approved_by ? 'Approuvé' : 'En attente'} 
                                  color={discount.approved_by ? 'success' : 'warning'} 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>
                                {discount.approved_at ? 
                                  format(new Date(discount.approved_at), 'dd/MM/yyyy', { locale: fr }) : 
                                  'Non approuvé'
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Aucun bon ou prise en charge pour cet étudiant
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentDetails; 