import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, InputLabel, FormControl,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Stack, Avatar, Chip, Card, CardContent
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Male, Female } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import SecretarySidebar from '../components/SecretarySidebar';

// Interfaces
interface Student {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  city: string; // for 'quartier'
  classe: string; // class name
  class_id: number;
  moyenne?: number;
  registration_number?: string;
}

interface Classe {
    id: number;
    name: string;
}

const GestionEleves = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        class_id: '',
        gender: '',
        age: '',
        quartier: ''
    });
    const [dynamicTitle, setDynamicTitle] = useState('Liste de tous les élèves');
    const [schoolYear, setSchoolYear] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    });

    const fetchStudents = async (currentFilters = filters) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const params = {
                class_id: currentFilters.class_id || undefined,
                gender: currentFilters.gender || undefined,
                age_range: currentFilters.age || undefined,
                quartier: currentFilters.quartier || undefined,
                school_year: schoolYear
            };
            const response = await axios.get('http://localhost:5000/api/students', { headers, params });
            console.log('Données brutes des étudiants reçues:', response.data);
            setStudents(response.data);
        } catch (error) {
            console.error("Erreur lors du filtrage des étudiants:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        let isMounted = true;
        
        const fetchInitialData = async () => {
            if (!isMounted) return;
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const classesPromise = axios.get('http://localhost:5000/api/classes', { headers });
                const studentsPromise = axios.get('http://localhost:5000/api/students', { headers, params: { school_year: schoolYear } });
                
                const [classesRes, studentsRes] = await Promise.all([classesPromise, studentsPromise]);

                if (isMounted) {
                    setClasses(classesRes.data);
                    setStudents(studentsRes.data);
                }

            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchInitialData();
        
        return () => {
            isMounted = false;
        };
    }, [schoolYear]);

    useEffect(() => {
        let isMounted = true;
        
        let title = 'Liste des élèves';
        const activeFilters: string[] = [];
    
        if (filters.class_id) {
            const className = classes.find(c => c.id === Number(filters.class_id))?.name;
            if (className) activeFilters.push(`de la classe ${className}`);
        }
        if (filters.gender) {
            activeFilters.push(filters.gender === 'Masculin' ? 'hommes' : 'femmes');
        }
        if (filters.age) {
            activeFilters.push(filters.age === 'majeur' ? 'majeurs' : 'mineurs');
        }
        if (filters.quartier) {
            activeFilters.push(`du quartier "${filters.quartier}"`);
        }
    
        const hasActiveFilters = filters.class_id || filters.gender || filters.age || filters.quartier;

        if (activeFilters.length > 0) {
            title = `Résultats pour les élèves ${activeFilters.join(' et ')}`;
        }
    
        if (students.length === 0 && hasActiveFilters) {
            title = `Aucun élève ne correspond à votre recherche`;
        } else if (!hasActiveFilters) {
            title = 'Liste de tous les élèves';
        }
    
        if (isMounted) setDynamicTitle(title);
        
        return () => {
            isMounted = false;
        };
    }, [filters, students, classes]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name!]: value as string }));
    };

    const handleSearch = () => {
        fetchStudents(filters);
    };

    const resetFilters = () => {
      const initialFilters = { class_id: '', gender: '', age: '', quartier: '' };
      setFilters(initialFilters);
      fetchStudents(initialFilters);
    }

    const calculateAge = (dob: string): number | null => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        if (isNaN(birthDate.getTime()) || birthDate > today) {
            return null;
        }
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const summaryStats = useMemo(() => {
        const boys = students.filter(s => {
            if (!s.gender) return false;
            const gender = s.gender.toLowerCase().trim();
            return ['masculin', 'm', 'homme'].includes(gender);
        }).length;
        const girls = students.filter(s => {
            if (!s.gender) return false;
            const gender = s.gender.toLowerCase().trim();
            return ['féminin', 'f', 'femme'].includes(gender);
        }).length;

        return {
            total: students.length,
            boys,
            girls,
        };
    }, [students]);

    const getGenderDisplay = (genderStr?: string) => {
        if (!genderStr) return null;
        const gender = genderStr.toLowerCase().trim();

        if (['masculin', 'm', 'homme'].includes(gender)) {
            return { label: 'H', icon: <Male fontSize="small" />, color: 'info' as 'info' };
        }
        if (['féminin', 'f', 'femme'].includes(gender)) {
            return { label: 'F', icon: <Female fontSize="small" />, color: 'secondary' as 'secondary' };
        }
        return null;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <SecretarySidebar />
            <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#f4f6f8' }}>
                <style>
                    {`
                        @media print {
                            .no-print {
                                display: none !important;
                            }
                            .printable-area {
                                box-shadow: none !important;
                            }
                        }
                    `}
                </style>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} className="no-print">
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Gestion des Élèves
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button 
                            variant="contained" 
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                        >
                            Imprimer la liste
                        </Button>
                        <Button 
                            variant="outlined" 
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/secretary/dashboard')}
                        >
                            Retour
                        </Button>
                    </Stack>
                </Stack>

                <Box className="no-print" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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

                <Card className="no-print" sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={2.5}>
                                <FormControl fullWidth>
                                    <InputLabel>Classe</InputLabel>
                                    <Select name="class_id" value={filters.class_id} label="Classe" onChange={handleFilterChange as any}>
                                        <MenuItem value=""><em>Toutes</em></MenuItem>
                                        {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Genre</InputLabel>
                                    <Select name="gender" value={filters.gender} label="Genre" onChange={handleFilterChange as any}>
                                        <MenuItem value=""><em>Tous</em></MenuItem>
                                        <MenuItem value="Masculin">Hommes</MenuItem>
                                        <MenuItem value="Féminin">Femmes</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Âge</InputLabel>
                                    <Select name="age" value={filters.age} label="Âge" onChange={handleFilterChange as any}>
                                        <MenuItem value=""><em>Tous</em></MenuItem>
                                        <MenuItem value="majeur">Majeur (18+)</MenuItem>
                                        <MenuItem value="mineur">Mineur (&lt;18)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.5}>
                                <TextField
                                    name="quartier"
                                    label="Quartier"
                                    value={filters.quartier}
                                    onChange={handleFilterChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Stack direction="row" spacing={1}>
                                    <Button variant="contained" onClick={handleSearch}>Rechercher</Button>
                                    <Button variant="outlined" onClick={resetFilters}>Réinitialiser</Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                
                <Typography variant="h6" sx={{ mb: 2, fontWeight: '500' }}>
                    {dynamicTitle}
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                ) : (
                    <Paper sx={{ overflow: 'hidden', borderRadius: 2, boxShadow: 1 }} className="printable-area">
                        <TableContainer sx={{ maxHeight: '60vh' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: 'primary.dark', color: 'white', fontWeight: '600' } }}>
                                        <TableCell>Matricule</TableCell>
                                        <TableCell>Élève</TableCell>
                                        <TableCell>Classe</TableCell>
                                        <TableCell>Genre</TableCell>
                                        <TableCell>Âge</TableCell>
                                        <TableCell>Quartier</TableCell>
                                        <TableCell align="right">Moyenne</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map(student => {
                                        const studentAge = calculateAge(student.date_of_birth);
                                        const genderDisplay = getGenderDisplay(student.gender);

                                        return (
                                            <TableRow 
                                                key={student.id} 
                                                hover 
                                                sx={{
                                                    '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => navigate(`/secretary/student-details/${student.id}`)}
                                            >
                                                <TableCell>{student.registration_number || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>{student.first_name?.[0]}{student.last_name?.[0]}</Avatar>
                                                        {student.first_name} {student.last_name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{student.classe || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {genderDisplay ? (
                                                        <Chip
                                                            icon={genderDisplay.icon}
                                                            label={genderDisplay.label}
                                                            color={genderDisplay.color}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ) : 'N/A'}
                                                </TableCell>
                                                <TableCell>{studentAge !== null ? studentAge : 'N/A'}</TableCell>
                                                <TableCell>{student.city}</TableCell>
                                                <TableCell align="right">{student.moyenne != null ? Number(student.moyenne).toFixed(2) : 'N/A'}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                         <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#f5f5f5' }}>
                            <Typography variant="body1">Total: <strong>{summaryStats.total}</strong></Typography>
                            {filters.gender !== 'Masculin' && <Typography variant="body1">Garçons: <strong>{summaryStats.boys}</strong></Typography>}
                            {filters.gender !== 'Féminin' && <Typography variant="body1">Filles: <strong>{summaryStats.girls}</strong></Typography>}
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default GestionEleves; 