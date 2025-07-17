import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Fade,
  Zoom,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import SecretarySidebar from '../../components/SecretarySidebar';
import { blue, green, orange, purple } from '@mui/material/colors';
import axios from 'axios';

const Teachers = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    subject_ids: string[];
    qualification: string;
    address: string;
    city: string;
  }>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    subject_ids: [],
    qualification: '',
    address: '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const qualifications = [
    'Licence',
    'Master',
    'Doctorat',
    'CAPES',
    'Agrégation',
    'Certification',
    'Autre',
  ];

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://schoolapp.sp-p6.com/api/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des professeurs');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://schoolapp.sp-p6.com/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des matières", err);
      setError('Erreur lors du chargement des matières. Assurez-vous d\'être connecté.');
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://schoolapp.sp-p6.com/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isMounted) return;
      await fetchTeachers();
      await fetchSubjects();
      await fetchClasses();
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchTeachers, fetchSubjects, fetchClasses]);

  const filteredTeachers = teachers.filter((teacher) =>
    (teacher.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.subject_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddTeacher = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      subject_ids: [],
      qualification: '',
      address: '',
      city: '',
    });
    setAddModalOpen(true);
  };

  const handleEditTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setFormData({
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      subject_ids: teacher.subjects ? teacher.subjects.map((s: any) => String(s.id)) : [],
      qualification: teacher.qualification || '',
      address: teacher.address || '',
      city: teacher.city || '',
    });
    setEditModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      alert('Veuillez remplir les champs obligatoires (Nom, Prénom, Email)');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...formData,
        subject_ids: formData.subject_ids.map((id: string) => Number(id)),
      };
      if (editModalOpen && selectedTeacher) {
        await axios.put(`http://schoolapp.sp-p6.com/api/teachers/${selectedTeacher.id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://schoolapp.sp-p6.com/api/teachers', dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setAddModalOpen(false);
      setEditModalOpen(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce professeur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://schoolapp.sp-p6.com/api/teachers/${teacherId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTeachers();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const printContents = tableRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=900');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Liste des professeurs</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background:#1976d2;color:#fff;} </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h2>Liste des professeurs</h2>');
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
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)' }}>
      <SecretarySidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Gestion des Professeurs
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddTeacher}
                sx={{
                  background: `linear-gradient(45deg, ${green[500]} 30%, ${green[700]} 90%)`,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${green[600]} 30%, ${green[800]} 90%)`,
                  },
                  px: 3,
                  py: 1,
                }}
              >
                Nouveau Professeur
              </Button>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  background: `linear-gradient(45deg, ${blue[500]} 30%, ${blue[700]} 90%)`,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${blue[600]} 30%, ${blue[800]} 90%)`,
                  },
                  px: 3,
                  py: 1,
                }}
              >
                Imprimer
              </Button>
            </Box>
          </Box>

          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un professeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          <div ref={tableRef}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)` }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nom</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Prénom</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Téléphone</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Matière</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Qualification</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Classes</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">Chargement...</TableCell>
                      </TableRow>
                    )}
                    {error && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ color: 'error.main' }}>{error}</TableCell>
                      </TableRow>
                    )}
                    {filteredTeachers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((teacher, index) => (
                        <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }} key={teacher.id}>
                          <TableRow 
                            hover 
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                cursor: 'pointer',
                              },
                            }}
                          >
                            <TableCell>{teacher.last_name}</TableCell>
                            <TableCell>{teacher.first_name}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>{teacher.phone}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {teacher.subjects.map((s: any) => (
                                  <Chip key={s.id} label={s.name} size="small" />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>{teacher.qualification}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(teacher.classes || []).map((c: any) => (
                                  <Chip key={c.id} label={c.name} size="small" color="info" />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Tooltip title="Voir détails">
                                  <IconButton color="primary" size="small">
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Modifier">
                                  <IconButton color="primary" size="small" onClick={() => handleEditTeacher(teacher)}>
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <IconButton color="error" size="small" onClick={() => handleDeleteTeacher(teacher.id)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </Zoom>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredTeachers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '.MuiTablePagination-select': {
                    borderRadius: 1,
                  },
                  '.MuiTablePagination-selectIcon': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            </Paper>
          </div>

          {/* Modal d'ajout/édition */}
          <Dialog open={addModalOpen || editModalOpen} onClose={() => { setAddModalOpen(false); setEditModalOpen(false); }} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${theme.palette.divider}`}}>
              <PersonIcon color="primary" />
              {editModalOpen ? 'Modifier les informations du professeur' : 'Inscrire un nouveau professeur'}
            </DialogTitle>
            <DialogContent sx={{ background: theme.palette.grey[50], pt: '20px !important' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Prénom"
                    required
                    fullWidth
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nom"
                    required
                    fullWidth
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    required
                    type="email"
                    fullWidth
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Téléphone"
                    fullWidth
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Matière(s) enseignée(s)</InputLabel>
                    <Select
                      multiple
                      value={formData.subject_ids}
                      label="Matière(s) enseignée(s)"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subject_ids: e.target.value as string[],
                        })
                      }
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((id) => {
                            const subj = subjects.find((s) => String(s.id) === id);
                            return subj ? <Chip key={id} label={subj.name} size="small" /> : null;
                          })}
                        </Box>
                      )}
                    >
                      {subjects.map((s) => (
                        <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Plus haute qualification</InputLabel>
                    <Select
                      value={formData.qualification}
                      label="Plus haute qualification"
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    >
                      {qualifications.map((qual) => (
                        <MenuItem key={qual} value={qual}>{qual}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                 <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ville"
                    fullWidth
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Adresse"
                    fullWidth
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px', borderTop: `1px solid ${theme.palette.divider}`}}>
              <Button onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }} color="secondary">
                Annuler
              </Button>
              <Button onClick={handleSubmit} color="primary" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}>
                {submitting ? 'Enregistrement...' : (editModalOpen ? 'Enregistrer les modifications' : 'Ajouter le professeur')}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default Teachers; 