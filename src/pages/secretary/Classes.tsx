import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import SecretarySidebar from '../../components/SecretarySidebar';
import axios from 'axios';

const Classes = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    level: '',
    principalTeacher: '',
    amount: '',
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editClass, setEditClass] = useState<any | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [existingAmount, setExistingAmount] = useState<string | null>(null);
  const [schoolYear, setSchoolYear] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchClasses = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/classes', {
          headers: { Authorization: `Bearer ${token}` },
          params: { school_year: schoolYear }
        });
        if (isMounted) {
          const normalized = res.data.map((c: any) => ({ ...c, id: c.id || c._id }));
          setClasses(normalized);
        }
      } catch (err: any) {
        if (isMounted) setError(err.response?.data?.message || 'Erreur lors du chargement des classes');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchClasses();
    
    return () => {
      isMounted = false;
    };
  }, [schoolYear]);

  useEffect(() => {
    if (existingAmount) {
      // Extraire le montant numérique de la chaîne (ex: "120000.00 F CFA (classe: 5 ème1)")
      const match = existingAmount.match(/([\d.,]+)/);
      if (match) {
        setNewClass(prev => ({ ...prev, amount: match[1].replace(',', '') }));
      }
    }
  }, [existingAmount]);

  const filteredClasses = classes.filter((classe) => {
    // On adapte les champs selon la structure de la classe reçue du backend
    const nom = classe.nom || classe.name || '';
    const niveau = classe.niveau || classe.level || '';
    const prof = classe.professeurPrincipal || classe.teacher || '';
    return (
      nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.toLowerCase().includes(searchTerm.toLowerCase()) ||
      niveau.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Ajout d'une classe
  const handleAddClass = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/classes', {
        name: newClass.name,
        level: newClass.level,
        academic_year: new Date().getFullYear().toString(),
        principal_teacher: newClass.principalTeacher,
        amount: newClass.amount,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Recharge la liste
      const res = await axios.get('http://localhost:5000/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
      setOpen(false);
      setNewClass({ name: '', level: '', principalTeacher: '', amount: '' });
      setSnackbar({ open: true, message: 'Classe ajoutée avec succès', severity: 'success' });
    } catch (err: any) {
      console.error("Erreur lors de l'ajout de la classe :", err, err?.response);
      setSnackbar({ open: true, message: err.response?.data?.message || "Erreur lors de l'ajout de la classe", severity: 'error' });
    }
  };

  // Suppression
  const handleDelete = async (id: number | string) => {
    if (!id) {
      console.error('Impossible de supprimer : id manquant');
      return;
    }
    if (window.confirm('Voulez-vous vraiment supprimer cette classe ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/classes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClasses(classes.filter(c => c.id !== id));
        setSnackbar({ open: true, message: 'Classe supprimée', severity: 'success' });
      } catch (err: any) {
        console.error('Erreur lors de la suppression de la classe :', err, err?.response);
        setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
      }
    }
  };

  // Edition
  const handleEditOpen = (classe: any) => {
    if (!classe.id) {
      console.error('Impossible de modifier : id manquant', classe);
      return;
    }
    setEditClass({
      ...classe,
      name: classe.nom || classe.name || '',
      level: classe.niveau || classe.level || '',
      principalTeacher: classe.principal_teacher || classe.principalTeacher || '',
      amount: classe.amount || '',
    });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditClass(null);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string, value: any } }) => {
    setEditClass((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditSubmit = async () => {
    if (!editClass) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/classes/${editClass.id}`, {
        name: editClass.name,
        level: editClass.level,
        academic_year: editClass.academic_year,
        principal_teacher: editClass.principalTeacher,
        amount: editClass.amount,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Recharge la liste
      const res = await axios.get('http://localhost:5000/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
      setEditOpen(false);
      setEditClass(null);
      setSnackbar({ open: true, message: 'Classe modifiée avec succès', severity: 'success' });
    } catch (err: any) {
      console.error('Erreur lors de la modification de la classe :', err, err?.response);
      setSnackbar({ open: true, message: 'Erreur lors de la modification', severity: 'error' });
    }
  };

  // Vérifier le montant existant pour un niveau
  const checkExistingAmount = async (level: string, excludeId?: number) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ level });
      if (excludeId) params.append('excludeId', excludeId.toString());
      
      const res = await axios.get(`http://localhost:5000/api/classes/check-amount?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.length > 0) {
        setExistingAmount(`${res.data[0].amount} F CFA (classe: ${res.data[0].name})`);
      } else {
        setExistingAmount(null);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du montant:', err);
    }
  };

  // Ajoute une fonction utilitaire pour extraire le montant numérique de existingAmount
  function extractAmount(existingAmount: string | null) {
    if (!existingAmount) return null;
    const match = existingAmount.match(/([\d.,]+)/);
    if (match) {
      return match[1].replace(',', '');
    }
    return null;
  }

  // Dans la modale d'ajout, calculer si le montant est différent
  const montantExistant = extractAmount(existingAmount);
  const montantDiff = montantExistant && newClass.amount && Number(newClass.amount) !== Number(montantExistant);

  console.log(classes);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SecretarySidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Gestion des Classes
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Nouvelle Classe
            </Button>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Année scolaire :</Typography>
            <FormControl size="small">
              <Select value={schoolYear} onChange={e => setSchoolYear(e.target.value)}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const now = new Date();
                  const y = now.getFullYear() - i;
                  const label = `${y - 1}-${y}`;
                  return <MenuItem key={label} value={label}>{label}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher une classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Grid container spacing={3}>
            {loading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>Chargement...</Paper>
              </Grid>
            )}
            {error && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center', color: 'red' }}>{error}</Paper>
              </Grid>
            )}
            {filteredClasses.map((classe) => {
              console.log('Classe affichée:', classe);
              return (
                <Grid item xs={12} md={6} lg={4} key={classe.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                        <Box>
                          <Typography variant="h5" component="div">
                            {classe.nom || classe.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Niveau: {classe.niveau || classe.level}
                          </Typography>
                        </Box>
                      </Box>

                      <List dense>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Professeur Principal"
                            secondary={classe.professeurPrincipal || classe.teacher || ''}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Effectif"
                            secondary={`${classe.students_count || 0} élèves`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Scolarité"
                            secondary={classe.amount ? `${Number(classe.amount).toLocaleString('fr-FR')} F CFA` : 'Non définie'}
                          />
                        </ListItem>
                      </List>

                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={classe.statut || 'Active'}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditOpen(classe)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(classe.id)}>
                        Supprimer
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Ajouter une nouvelle classe</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nom de la classe"
              fullWidth
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              name="name"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="niveau-label">Niveau</InputLabel>
              <Select
                labelId="niveau-label"
                value={newClass.level}
                label="Niveau"
                onChange={(e) => {
                  setNewClass({ ...newClass, level: e.target.value });
                  checkExistingAmount(e.target.value);
                }}
                name="level"
              >
                <MenuItem value="6ème">6ème</MenuItem>
                <MenuItem value="5ème">5ème</MenuItem>
                <MenuItem value="4ème">4ème</MenuItem>
                <MenuItem value="3ème">3ème</MenuItem>
                <MenuItem value="Seconde">Seconde</MenuItem>
                <MenuItem value="Première">Première</MenuItem>
                <MenuItem value="Terminale">Terminale</MenuItem>
              </Select>
            </FormControl>
            {existingAmount && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Montant existant pour ce niveau: {existingAmount}
              </Alert>
            )}
            {montantDiff && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Impossible d'ajouter une nouvelle classe pour ce niveau : le montant doit être identique à celui déjà existant ({montantExistant} F CFA).
              </Alert>
            )}
            <TextField
              margin="dense"
              label="Professeur principal"
              fullWidth
              value={newClass.principalTeacher}
              onChange={(e) => setNewClass({ ...newClass, principalTeacher: e.target.value })}
              name="principalTeacher"
            />
            <TextField
              margin="dense"
              label="Montant de la scolarité (F CFA)"
              type="number"
              fullWidth
              value={newClass.amount}
              onChange={(e) => setNewClass({ ...newClass, amount: e.target.value })}
              name="amount"
              placeholder="Ex: 150000"
              InputProps={{ readOnly: !!existingAmount }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleAddClass} disabled={!!montantDiff}>Ajouter</Button>
          </DialogActions>
        </Dialog>
        {/* Modale d'édition */}
        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle>Modifier la classe</DialogTitle>
          <DialogContent>
            {editClass && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Nom de la classe"
                  fullWidth
                  value={editClass.name}
                  onChange={handleEditChange}
                  name="name"
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel id="edit-niveau-label">Niveau</InputLabel>
                  <Select
                    labelId="edit-niveau-label"
                    value={editClass.level}
                    label="Niveau"
                    onChange={(e) => {
                      handleEditChange({ target: { name: 'level', value: e.target.value } });
                      checkExistingAmount(e.target.value, editClass.id);
                    }}
                    name="level"
                  >
                    <MenuItem value="6ème">6ème</MenuItem>
                    <MenuItem value="5ème">5ème</MenuItem>
                    <MenuItem value="4ème">4ème</MenuItem>
                    <MenuItem value="3ème">3ème</MenuItem>
                    <MenuItem value="Seconde">Seconde</MenuItem>
                    <MenuItem value="Première">Première</MenuItem>
                    <MenuItem value="Terminale">Terminale</MenuItem>
                  </Select>
                </FormControl>
                {existingAmount && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Montant existant pour ce niveau: {existingAmount}
                  </Alert>
                )}
                <TextField
                  margin="dense"
                  label="Professeur principal"
                  fullWidth
                  value={editClass.principalTeacher}
                  onChange={handleEditChange}
                  name="principalTeacher"
                />
                <TextField
                  margin="dense"
                  label="Montant de la scolarité (F CFA)"
                  type="number"
                  fullWidth
                  value={editClass.amount}
                  onChange={handleEditChange}
                  name="amount"
                  placeholder="Ex: 150000"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Annuler</Button>
            <Button variant="contained" onClick={handleEditSubmit}>Enregistrer</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Classes; 