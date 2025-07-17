import React, { useState, useRef } from 'react';
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
  Alert,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  useTheme,
  Fade,
  Zoom,
  Divider,
} from '@mui/material';
import { DatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import { green } from '@mui/material/colors';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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
  dateOfBirth: string; // string au lieu de Date | null
  gender: string;
  address: string;
  city: string;
  phone: string;
  email: string;

  // Informations académiques
  previousSchool: string;
  previousClass: string;
  specialNeeds: string;
  additionalInfo: string;

  // Documents
  documents: Document[];

  // Informations parent
  parentFirstName: string;
  parentLastName: string;
  parentPhone: string;
  parentEmail: string;
  parentContact: string;
}

const Receipt = ({ data, onClose, receiptRef, handleDownload }: {
  data: any,
  onClose: () => void,
  receiptRef: React.RefObject<HTMLDivElement>,
  handleDownload: () => void,
}) => (
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
        p: 4,
        borderRadius: 4,
        boxShadow: 6,
        maxWidth: 400,
        width: '100%',
        mx: 'auto',
        mb: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <img src="/logo.png" alt="Logo" style={{ width: 90, height: 90, objectFit: 'contain' }} />
      </Box>
      <Typography align="center" color="primary" sx={{ fontWeight: 700, mb: 1, fontSize: 20, letterSpacing: 1 }}>
        Pré-inscription en ligne
      </Typography>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
        Reçu de pré-inscription
      </Typography>
      <Divider sx={{ mb: 2, width: '100%' }} />
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 1 }}>
          <b>Nom :</b> {data.last_name} {data.first_name}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <b>Email :</b> {data.email}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <b>Matricule :</b> {data.registration_number}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <b>Date et heure :</b> {data.date}
        </Typography>
        <Divider sx={{ my: 2, width: '100%' }} />
        <Typography sx={{ mb: 1 }}>
          <b>Parent :</b> {data.parent_first_name} {data.parent_last_name}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <b>Téléphone parent :</b> {data.parent_phone}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <b>Email parent :</b> {data.parent_email}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <b>Contact parent :</b> {data.parent_contact}
        </Typography>
      </Box>
      <Divider sx={{ my: 2, width: '100%' }} />
      <Typography variant="body1" align="center" color="primary" sx={{ mt: 2, fontWeight: 500 }}>
        Veuillez vous présenter à l'établissement avec ce reçu pour finaliser votre inscription et obtenir vos codes d'accès. Le code parent vous sera fourni lors de la finalisation.
      </Typography>
    </Paper>
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', width: '100%', maxWidth: 400 }}>
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        onClick={handleDownload}
        sx={{ fontWeight: 600 }}
      >
        Télécharger le reçu
      </Button>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={onClose}
        sx={{ fontWeight: 600 }}
      >
        Fermer
      </Button>
    </Box>
  </Box>
);

const Registration = ({ onClose }: { onClose: () => void }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [activeStep, setActiveStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<RegistrationForm>({
    matricule: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '', // string vide
    gender: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    previousSchool: '',
    previousClass: '',
    specialNeeds: '',
    additionalInfo: '',
    documents: [
      { id: 'birth', name: 'Acte de naissance', file: null, status: 'pending' },
      { id: 'report', name: 'Bulletin scolaire', file: null, status: 'pending' },
      { id: 'id', name: 'Carte d\'identité', file: null, status: 'pending' },
      { id: 'vaccine', name: 'Carnet de vaccination', file: null, status: 'pending' },
    ],
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    parentContact: '',
  });

  // Gestion du montage/démontage du composant
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [receiptData, setReceiptData] = useState<any | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handleDownload = () => {
    if (receiptRef.current) {
      html2pdf().from(receiptRef.current).save('recu-inscription.pdf');
    }
  };

  const isValidDateFormat = (dateStr: string) => {
    // Vérifie le format AAAA-MM-JJ strictement
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };

  const handleNext = () => {
    // Validation des champs selon l'étape
    if (activeStep === 0) {
      // Validation des informations personnelles
      const dateStr = formData.dateOfBirth;
      if (!formData.matricule || !formData.firstName || !formData.lastName || 
          !formData.dateOfBirth || !formData.gender || !formData.address || 
          !formData.city || !formData.phone || !formData.email ||
          !formData.parentFirstName || !formData.parentLastName || 
          !formData.parentPhone || !formData.parentEmail || !formData.parentContact) {
        setSnackbar({
          open: true,
          message: 'Veuillez remplir tous les champs obligatoires',
          severity: 'error',
        });
        return;
      }
      if (!isValidDateFormat(dateStr)) {
        setSnackbar({
          open: true,
          message: 'Veuillez saisir une date de naissance valide (format AAAA-MM-JJ, pas de date future, ni de date impossible).',
          severity: 'error',
        });
        return;
      }
    } else if (activeStep === 1) {
      // Validation des informations académiques
      if (!formData.previousSchool || !formData.previousClass) {
        setSnackbar({
          open: true,
          message: 'Veuillez remplir les informations académiques',
          severity: 'error',
        });
        return;
      }
    } else if (activeStep === 2) {
      // Validation des documents
      if (!formData.documents.every(doc => doc.file)) {
        setSnackbar({
          open: true,
          message: 'Veuillez télécharger tous les documents requis',
          severity: 'error',
        });
        return;
      }
    }
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
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
      // Validation finale avant soumission
      const dateStr = formData.dateOfBirth;
      if (!formData.matricule || !formData.firstName || !formData.lastName || 
          !formData.dateOfBirth || !formData.gender || !formData.address || 
          !formData.city || !formData.phone || !formData.email ||
          !formData.previousSchool || !formData.previousClass ||
          !formData.parentFirstName || !formData.parentLastName || 
          !formData.parentPhone || !formData.parentEmail || !formData.parentContact) {
        setSnackbar({
          open: true,
          message: 'Veuillez remplir tous les champs obligatoires',
          severity: 'error',
        });
        return;
      }
      if (!isValidDateFormat(dateStr)) {
        setSnackbar({
          open: true,
          message: 'Veuillez saisir une date de naissance valide (format AAAA-MM-JJ, pas de date future, ni de date impossible).',
          severity: 'error',
        });
        return;
      }

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        registration_number: formData.matricule,
        email: formData.email,
        password: formData.matricule,
        previous_school: formData.previousSchool,
        previous_class: formData.previousClass,
        special_needs: formData.specialNeeds,
        additional_info: formData.additionalInfo,
        registration_mode: 'online',
        parent_first_name: formData.parentFirstName,
        parent_last_name: formData.parentLastName,
        parent_phone: formData.parentPhone,
        parent_email: formData.parentEmail,
        parent_contact: formData.parentContact,
      };

      const response = await axios.post('https://schoolapp.sp-p6.com/api/students/public-register', payload);
      const now = new Date();
      setReceiptData({
        ...payload,
        date: now.toLocaleString(),
        student_code: response.data.student_code,
        parent_code: null, // Le code parent sera généré à la finalisation
      });
      setSnackbar({
        open: true,
        message: 'Inscription soumise avec succès !',
        severity: 'success',
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
          <Grid container spacing={3} key={`step-${step}`}>
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
              {isMobile ? (
                <>
                  <label htmlFor="date-naissance" style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Date de naissance *</label>
                  <input
                    id="date-naissance"
                    type="text"
                    placeholder="AAAA-MM-JJ"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    style={{ width: '100%', marginBottom: 4, fontSize: 16, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    required
                  />
                  <span style={{ fontSize: 12, color: '#888' }}>
                    Format attendu : AAAA-MM-JJ. Saisissez la date manuellement.
                  </span>
                </>
              ) : (
                <TextField
                  required
                  fullWidth
                  label="Date de naissance"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Format attendu : AAAA-MM-JJ. Si le sélecteur ne s'ouvre pas, saisissez la date manuellement."
                />
              )}
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
                  <MenuItem value="Masculin">Masculin</MenuItem>
                  <MenuItem value="Féminin">Féminin</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
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
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3} key={`step-${step}`}>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Besoins particuliers"
                multiline
                rows={2}
                value={formData.specialNeeds}
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
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
              <TextField
                fullWidth
                label="Informations supplémentaires"
                multiline
                rows={3}
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3} key={`step-${step}`}>
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

  return (
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
        // Correction : aucun overflow sur mobile
        maxHeight: { sm: '98vh', xs: 'none' },
        overflowY: { sm: 'auto', xs: 'visible' },
        pb: { xs: 8, sm: 4 },
        '@keyframes fadeInUp': {
          from: { opacity: 0, transform: 'translateY(40px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {receiptData ? (
        <Receipt data={receiptData} onClose={onClose} receiptRef={receiptRef} handleDownload={handleDownload} />
      ) : (
        <Fade in={isMounted} timeout={500}>
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
              variant={window.innerWidth < 600 ? 'h5' : 'h4'}
              gutterBottom 
              align="center"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 4,
                fontSize: { xs: 24, sm: 32 },
              }}
            >
              Inscription en ligne
            </Typography>

            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: 4,
                '& .MuiStepLabel-label': {
                  fontWeight: 600,
                  fontSize: { xs: 13, sm: 16 },
                },
                '& .MuiStepIcon-root': {
                  color: theme.palette.primary.main,
                  fontSize: { xs: 20, sm: 24 },
                },
                '& .MuiStepIcon-root.Mui-active': {
                  color: theme.palette.primary.main,
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: green[500],
                },
              }}
            >
              {steps.map((label, index) => (
                <Step key={`step-${index}-${label}`}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Zoom in={isMounted} timeout={500}>
              <Box key={`step-content-${activeStep}`}
                sx={{
                  px: { xs: 0, sm: 2 },
                }}
              >
                {renderStepContent(activeStep)}
              </Box>
            </Zoom>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              gap: { xs: 2, sm: 0 },
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
                  width: { xs: '100%', sm: 'auto' },
                }}
                fullWidth={window.innerWidth < 600}
              >
                Retour
              </Button>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
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
                    width: { xs: '100%', sm: 'auto' },
                  }}
                  fullWidth={window.innerWidth < 600}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  onClick={handleNext}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                    color: 'white',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                    },
                    px: 4,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                  fullWidth={window.innerWidth < 600}
                >
                  {activeStep === steps.length - 1 ? 'Soumettre' : 'Suivant'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}

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
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export function RegistrationMinimal({ onClose }: { onClose?: () => void }) {
  const [formData, setFormData] = React.useState({
    matricule: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    parentContact: '',
  });
  const [error, setError] = React.useState('');
  const isValidDateFormat = (dateStr: string) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.matricule || !formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender || !formData.address || !formData.city || !formData.phone || !formData.email || !formData.parentFirstName || !formData.parentLastName || !formData.parentPhone || !formData.parentEmail || !formData.parentContact) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!isValidDateFormat(formData.dateOfBirth)) {
      setError('La date de naissance doit être au format AAAA-MM-JJ.');
      return;
    }
    setError('');
    alert('Formulaire soumis ! (version minimaliste)');
    if (onClose) onClose();
  };
  return (
    <div style={{ padding: 8, maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2' }}>Inscription en ligne (simple)</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleSubmit} autoComplete="off">
        <label>Matricule*<br /><input name="matricule" value={formData.matricule} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Date de naissance*<br /><input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required placeholder="AAAA-MM-JJ" style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Prénom*<br /><input name="firstName" value={formData.firstName} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Nom*<br /><input name="lastName" value={formData.lastName} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Genre*<br />
          <select name="gender" value={formData.gender} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }}>
            <option value="">Choisir...</option>
            <option value="Masculin">Masculin</option>
            <option value="Féminin">Féminin</option>
            <option value="Autre">Autre</option>
          </select>
        </label><br />
        <label>Adresse*<br /><input name="address" value={formData.address} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Ville*<br /><input name="city" value={formData.city} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Téléphone*<br /><input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Email*<br /><input name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Prénom du parent*<br /><input name="parentFirstName" value={formData.parentFirstName} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Nom du parent*<br /><input name="parentLastName" value={formData.parentLastName} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Téléphone du parent*<br /><input name="parentPhone" value={formData.parentPhone} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Email du parent*<br /><input name="parentEmail" value={formData.parentEmail} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <label>Contact du parent*<br /><input name="parentContact" value={formData.parentContact} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} /></label><br />
        <button type="submit" style={{ width: '100%', padding: 12, background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 16 }}>Soumettre</button>
      </form>
    </div>
  );
}

export default Registration; 