import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Fade,
  Zoom,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import { blue, green, orange, purple, pink } from '@mui/material/colors';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import SecretarySidebar from '../components/SecretarySidebar';

const steps = ['Informations personnelles', 'Informations académiques', 'Documents requis'];

interface Document {
  id: string;
  name: string;
  file: File | null;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
}

interface RegistrationForm {
  // Informations personnelles
  matricule: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string;
  address: string;
  city: string;
  phone: string;
  email: string;

  // Informations académiques
  previousSchool: string;
  previousClass: string;
  desiredClass: string | number;
  desiredClassName: string;

  // Documents
  documents: Document[];
  
  // Informations parent
  parentFirstName: string;
  parentLastName: string;
  parentPhone: string;
  parentEmail: string;
  parentContact: string;

  // Nouveau champ pour le montant payé
  paymentAmount: string;
}

// Ajoute ce type pour éviter l'erreur TypeScript si besoin
declare global {
  interface Window {
    MonnaieFusion?: any;
  }
}

const Receipt = ({ data, onClose, receiptRef, handleDownload }: {
  data: any,
  onClose: () => void,
  receiptRef: React.RefObject<HTMLDivElement>,
  handleDownload: () => void,
}) => {
  const remaining = (data.total_due || 0) - (data.payment_amount || 0);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printContents = receiptRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=700,width=900');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Reçu d\'inscription</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;} .receipt-container{padding:30px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        justifyContent: 'center',
        background: '#f5f7fa',
        py: 4,
      }}
    >
      <Paper
        ref={receiptRef}
        sx={{
          p: { xs: 2, sm: 5 },
          borderRadius: 4,
          boxShadow: 6,
          maxWidth: 700,
          width: '100%',
          mx: 'auto',
          background: 'white',
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 100, height: 100, objectFit: 'contain' }} />
        </Box>
        <Typography align="center" color="primary" sx={{ fontWeight: 700, mb: 1, fontSize: 22, letterSpacing: 1 }}>
          Inscription en présentiel
        </Typography>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
          Reçu d'inscription
        </Typography>
        <Divider sx={{ mb: 3, width: '100%' }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, alignSelf: 'flex-start', width: '100%' }}>Informations de l'élève</Typography>
        <Grid container spacing={1} sx={{ width: '100%', mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography><b>Nom & Prénoms:</b> {data.last_name} {data.first_name}</Typography>
            <Typography><b>Matricule:</b> {data.registration_number || 'N/A'}</Typography>
             <Typography><b>Code Élève:</b> <Chip label={data.student_code} color="primary" size="small" /></Typography>
            <Typography><b>Classe:</b> {data.desiredClassName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><b>Date d'inscription:</b> {data.date}</Typography>
            <Typography><b>Parent:</b> {data.parent_first_name} {data.parent_last_name}</Typography>
             <Typography><b>Code Parent:</b> <Chip label={data.parent_code} color="secondary" size="small" /></Typography>
            <Typography><b>Contact Parent:</b> {data.parent_phone}</Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ width: '100%' }}><Chip label="Détails du Paiement" /></Divider>
        
        <Box sx={{width: '100%', mt: 2}}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Montant total de la scolarité</TableCell>
                <TableCell align="right">{Number(data.total_due || 0).toLocaleString('fr-FR')} F CFA</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Montant de ce versement</TableCell>
                <TableCell align="right"><b>{Number(data.payment_amount).toLocaleString('fr-FR')} F CFA</b></TableCell>
              </TableRow>
                <TableRow sx={{ '& td, & th': { border: 0 }, background: remaining > 0 ? 'rgba(255, 0, 0, 0.05)' : 'rgba(0, 255, 0, 0.05)'}}>
                <TableCell sx={{ fontWeight: 'bold' }}>Reste à payer</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: remaining > 0 ? 'error.main' : 'success.main' }}>
                  {remaining.toLocaleString('fr-FR')} F CFA
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                  Le secrétariat
              </Typography>
              <Typography variant="body2">
                  <b>Statut:</b> {remaining > 0 ? <Chip label="Non soldé" color="error" size="small"/> : <Chip label="Soldé" color="success" size="small"/>}
              </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, width: '100%' }} />
      </Paper>
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', width: '100%', maxWidth: 700, mt: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleDownload}
          sx={{ fontWeight: 600, px: 4, py: 1.5, fontSize: 16 }}
        >
          Télécharger le reçu
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrint}
          sx={{ fontWeight: 600, px: 4, py: 1.5, fontSize: 16 }}
        >
          Imprimer le reçu
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', width: '100%', maxWidth: 700, mt: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{ fontWeight: 600, px: 4, py: 1.5, fontSize: 16 }}
        >
          Fermer
        </Button>
      </Box>
    </Box>
  );
};

// Fonction utilitaire pour convertir un étudiant backend en RegistrationForm
function mapStudentToRegistrationForm(student: any): RegistrationForm {
  student = student || {};
  return {
    matricule: student.registration_number || '',
    firstName: student.first_name || student.firstName || '',
    lastName: student.last_name || student.lastName || '',
    dateOfBirth: student.date_of_birth ? new Date(student.date_of_birth) : (student.dateOfBirth || null),
    gender: student.gender || '',
    address: student.address || '',
    city: student.city || '',
    phone: student.phone || '',
    email: student.email || '',
    previousSchool: student.previous_school || student.previousSchool || '',
    previousClass: student.previous_class || student.previousClass || '',
    desiredClass: '',
    desiredClassName: '',
    documents: [
      { id: 'birth', name: 'Acte de naissance', file: null, status: 'pending' },
      { id: 'report', name: 'Bulletin scolaire', file: null, status: 'pending' },
      { id: 'id', name: 'Carte d\'identité', file: null, status: 'pending' },
      { id: 'vaccine', name: 'Carnet de vaccination', file: null, status: 'pending' },
    ],
    parentFirstName: student.parent_first_name || student.parentFirstName || '',
    parentLastName: student.parent_last_name || student.parentLastName || '',
    parentPhone: student.parent_phone || student.parentPhone || '',
    parentEmail: student.parent_email || student.parentEmail || '',
    parentContact: student.parent_contact || student.parentContact || '',
    paymentAmount: '',
  };
}

const InscrptionPre = ({ onClose, initialData }: { onClose: () => void, initialData?: any }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  // Initialisation du formulaire avec initialData si présente
  const [formData, setFormData] = useState<RegistrationForm>(mapStudentToRegistrationForm(initialData));

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Correction : ref et download ici
  const receiptRef = useRef<HTMLDivElement>(null);
  const handleDownload = () => {
    if (receiptRef.current) {
      html2pdf().from(receiptRef.current).save('recu-inscription.pdf');
    }
  };

  const [classes, setClasses] = useState<{ id: number, name: string, amount: number }[]>([]);
  useEffect(() => {
    let isMounted = true;
    
    axios.get('https://schoolapp.sp-p6.com/api/classes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (isMounted) setClasses(res.data);
      })
      .catch(() => {
        if (isMounted) setClasses([]);
      });
      
    return () => {
      isMounted = false;
    };
  }, []);

  // Ajout : variables globales pour la validation du montant
  const selectedClass = classes.find(c => c.id === Number(formData.desiredClass));
  const classAmount = selectedClass ? selectedClass.amount : 0;
  const paymentAmount = Number(formData.paymentAmount);
  const isPaymentValid = selectedClass && paymentAmount > 0 && paymentAmount <= classAmount;

  const handleNext = () => {
    if (activeStep === 2 && !formData.documents.every(doc => doc.file)) {
      setSnackbar({
        open: true,
        message: 'Veuillez télécharger tous les documents requis',
        severity: 'error',
      });
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFileUpload = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === documentId
            ? { ...doc, file, status: 'uploaded' }
            : doc
        ),
      }));
    }
  };

  const handleDeleteFile = (documentId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(doc =>
        doc.id === documentId
          ? { ...doc, file: null, status: 'pending' }
          : doc
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.gender) {
        setSnackbar({
          open: true,
          message: 'Veuillez sélectionner le genre',
          severity: 'error',
        });
        return;
      }
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth
          ? formData.dateOfBirth instanceof Date
            ? formData.dateOfBirth.toISOString().split('T')[0]
            : formData.dateOfBirth
          : null,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        registration_number: formData.matricule,
        email: formData.email,
        password: formData.matricule, // ou un champ mot de passe saisi
        previous_school: formData.previousSchool,
        previous_class: formData.previousClass,
        desired_class: formData.desiredClass,
        special_needs: '',
        additional_info: '',
        registration_mode: 'onsite', // mode présentiel
        parent_first_name: formData.parentFirstName,
        parent_last_name: formData.parentLastName,
        parent_phone: formData.parentPhone,
        parent_email: formData.parentEmail,
        parent_contact: formData.parentContact,
        payment_amount: Number(formData.paymentAmount) || 0,
      };
      console.log('GENRE:', formData.gender);
      console.log('PAYLOAD:', payload);

      await axios.post(
        'https://schoolapp.sp-p6.com/api/students',
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
        .then((response) => {
          const now = new Date();
          setReceiptData({
            ...payload,
            date: now.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }),
            student_code: response.data.student_code,
            parent_code: response.data.parent_code,
            desiredClassName: formData.desiredClassName,
            total_due: classAmount,
            payment_amount: formData.paymentAmount,
          });
          setSnackbar({
            open: true,
            message: 'Inscription soumise avec succès !',
            severity: 'success',
          });
        });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de l\'inscription',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDocumentStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon color="success" />;
      case 'uploaded':
        return <PendingIcon color="primary" />;
      case 'rejected':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Matricule"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                helperText="Numéro d'identification unique de l'étudiant"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                <DatePicker
                  label="Date de naissance"
                  value={formData.dateOfBirth}
                  onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                  slotProps={{
                    textField: { fullWidth: true },
                    popper: { disablePortal: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="genre-label">Genre</InputLabel>
                <Select
                  labelId="genre-label"
                  value={formData.gender}
                  label="Genre"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  MenuProps={{ disablePortal: true }}
                >
                  <MenuItem value=""><em>Choisir...</em></MenuItem>
                  <MenuItem value="M">Masculin</MenuItem>
                  <MenuItem value="F">Féminin</MenuItem>
                  <MenuItem value="Other">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, mb: 1 }}>
                Informations du parent
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Prénom du parent"
                value={formData.parentFirstName}
                onChange={(e) => setFormData({ ...formData, parentFirstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nom du parent"
                value={formData.parentLastName}
                onChange={(e) => setFormData({ ...formData, parentLastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Téléphone du parent"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email du parent"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Contact du parent"
                value={formData.parentContact}
                onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="desired-class-label">Classe souhaitée</InputLabel>
                <Select
                  labelId="desired-class-label"
                  value={formData.desiredClass}
                  label="Classe souhaitée"
                  onChange={e => {
                    const classId = e.target.value;
                    setFormData({ ...formData, desiredClass: classId, desiredClassName: classes.find(c => c.id === Number(classId))?.name || '', paymentAmount: '' });
                  }}
                >
                  {classes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedClass && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Montant de la scolarité : <b>{classAmount.toLocaleString('fr-FR')} F CFA</b>
                </Typography>
              )}
            </Grid>
            {selectedClass && (
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Montant du versement"
                  type="number"
                  value={formData.paymentAmount}
                  onChange={e => setFormData({ ...formData, paymentAmount: e.target.value })}
                  error={!!formData.paymentAmount && paymentAmount > classAmount}
                  helperText={
                    !!formData.paymentAmount && paymentAmount > classAmount
                      ? `Le montant ne peut pas dépasser la scolarité de la classe (${classAmount ? classAmount.toLocaleString('fr-FR') : '...'} F CFA)`
                      : ''
                  }
                  inputProps={{ min: 0, max: classAmount || undefined }}
                />
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="École précédente"
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Classe précédente"
                value={formData.previousClass}
                onChange={(e) => setFormData({ ...formData, previousClass: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="desired-class-label">Classe souhaitée</InputLabel>
                <Select
                  labelId="desired-class-label"
                  value={formData.desiredClass}
                  label="Classe souhaitée"
                  onChange={e => {
                    const classId = e.target.value;
                    setFormData({ ...formData, desiredClass: classId, desiredClassName: classes.find(c => c.id === Number(classId))?.name || '', paymentAmount: '' });
                  }}
                >
                  {classes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedClass && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Montant de la scolarité : <b>{classAmount.toLocaleString('fr-FR')} F CFA</b>
                </Typography>
              )}
            </Grid>
            {selectedClass && (
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Montant du versement"
                  type="number"
                  value={formData.paymentAmount}
                  onChange={e => setFormData({ ...formData, paymentAmount: e.target.value })}
                  error={!!formData.paymentAmount && paymentAmount > classAmount}
                  helperText={
                    !!formData.paymentAmount && paymentAmount > classAmount
                      ? `Le montant ne peut pas dépasser la scolarité de la classe (${classAmount ? classAmount.toLocaleString('fr-FR') : '...'} F CFA)`
                      : ''
                  }
                  inputProps={{ min: 0, max: classAmount || undefined }}
                />
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              >
                Documents requis
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                paragraph
                sx={{ mb: 3 }}
              >
                Veuillez télécharger les documents suivants. Format accepté : PDF, JPG, PNG (max 5MB)
              </Typography>
            </Grid>
            {formData.documents.map((doc) => (
              <Grid item xs={12} key={doc.id}>
                <Card 
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 2,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 500 }}>{doc.name}</Typography>
                        {getDocumentStatusIcon(doc.status)}
                      </Box>
                      <Box>
                        {!doc.file ? (
                          <Button
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            variant="outlined"
                            sx={{
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                borderColor: theme.palette.primary.dark,
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                              },
                            }}
                          >
                            Télécharger
                            <input
                              type="file"
                              hidden
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(doc.id, e)}
                            />
                          </Button>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {doc.file.name}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteFile(doc.id)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      default:
        return null;
    }
  };

  if (receiptData) {
    return (
      <Box sx={{ display: 'flex' }}>
        <SecretarySidebar />
        <Box component="main" sx={{ flexGrow: 1, width: '100%', p: { xs: 1, md: 4 }, bgcolor: '#f6f8fa', minHeight: '100vh' }}>
          {<Receipt data={receiptData} onClose={onClose} receiptRef={receiptRef} handleDownload={handleDownload} />}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SecretarySidebar />
      <Box component="main" sx={{ flexGrow: 1, width: '100%', p: { xs: 1, md: 4 }, bgcolor: '#f6f8fa', minHeight: '100vh' }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 700,
            mx: 'auto',
            p: { xs: 1, sm: 3 },
            borderRadius: 5,
            boxShadow: 6,
            background: 'white',
            position: 'relative',
            transition: 'box-shadow 0.3s',
            animation: 'fadeInUp 0.5s',
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(40px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Fade in={true} timeout={500}>
            <Paper sx={{
              p: { xs: 1, sm: 4 },
              borderRadius: 4,
              boxShadow: 3,
              background: 'white',
              minWidth: { xs: '100%', sm: 500 },
              maxWidth: 700,
              mx: 'auto',
              mb: 2,
            }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                align="center"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 4,
                }}
              >
                Inscription en présentiel
              </Typography>

              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  mb: 4,
                  '& .MuiStepLabel-label': {
                    fontWeight: 600,
                  },
                  '& .MuiStepIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: green[500],
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Zoom in={true} timeout={500}>
                <Box>
                  {renderStepContent(activeStep)}
                </Box>
              </Zoom>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 4,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                >
                  Retour
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onClose}
                    sx={{
                      borderColor: theme.palette.error.main,
                      color: theme.palette.error.main,
                      '&:hover': {
                        borderColor: theme.palette.error.dark,
                        backgroundColor: 'rgba(211, 47, 47, 0.04)',
                      },
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={!isPaymentValid}
                    sx={{
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                      color: 'white',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                      },
                      px: 4,
                    }}
                  >
                    {activeStep === steps.length - 1 ? 'Soumettre' : 'Suivant'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Fade>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ 
                width: '100%',
                boxShadow: 3,
                '& .MuiAlert-icon': {
                  fontSize: 24,
                },
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
};

export default InscrptionPre; 