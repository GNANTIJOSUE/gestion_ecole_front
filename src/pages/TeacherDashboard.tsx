import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl, Container, Stack, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Grid, IconButton, Chip, FormControlLabel, Switch, ToggleButtonGroup, ToggleButton, Fade
} from '@mui/material';
import axios from 'axios';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ApartmentIcon from '@mui/icons-material/Apartment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Class {
  id: number;
  name: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
}

interface Grade {
  id: number;
  grade: number;
  semester: string;
  academic_year: string;
  created_at: string;
  class_id: number;
  student_id: number;
  subject_id: number;
  coefficient?: number;
  is_published: boolean;
}

interface Subject { 
  id: number; 
  name: string; 
  created_at?: string; 
}

interface Absence {
  id?: number;
  student_id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  date: string;
  reason: string;
  status: 'excused' | 'unexcused';
  duration_hours?: number;
  semester?: string;
}

type AbsenceState = Map<number, { 
  status: 'present' | 'absent'; 
  reason: string; 
  justified: boolean; 
  initialStatus: 'present' | 'absent'; 
  duration_hours: number 
}>;

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [semester, setSemester] = useState('1er trimestre');
  const [academicYear, setAcademicYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getFullYear() + 1}`;
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });
  const [editMode, setEditMode] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [coefficient, setCoefficient] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [viewStep, setViewStep] = useState<'subjects' | 'classes' | 'students'>('subjects');
  const [subjectClasses, setSubjectClasses] = useState<Class[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [absenceData, setAbsenceData] = useState<AbsenceState>(new Map());
  const [classAbsences, setClassAbsences] = useState<Absence[]>([]);
  const [studentGradesSnapshot, setStudentGradesSnapshot] = useState<Grade[]>([]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nouvelle note ajoutée', message: 'Une nouvelle note a été ajoutée à votre classe.', date: new Date(), read: false },
    { id: 2, title: 'Absence signalée', message: 'Un élève a été signalé absent.', date: new Date(), read: false },
  ]);
  const [anchorNotif, setAnchorNotif] = useState<null | HTMLElement>(null);
  const [openConfirmStudents, setOpenConfirmStudents] = useState(false);
  const [openConfirmAdmin, setOpenConfirmAdmin] = useState(false);
  const [publishingGrades, setPublishingGrades] = useState(false);
  const trimestres = ["1er trimestre", "2e trimestre", "3e trimestre"];
  const [selectedTrimester, setSelectedTrimester] = useState<string>(trimestres[0]);
  const [openAbsenceDialog, setOpenAbsenceDialog] = useState(false);
  const [absenceList, setAbsenceList] = useState<{ [studentId: number]: { absent: boolean; reason: string; status: 'excused' | 'unexcused'; duration: number } }>({});
  const navigate = useNavigate();
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const SCHOOL_YEARS = getSchoolYears(5);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [noteTrimester, setNoteTrimester] = useState(selectedTrimester);
  const [loadingAbsences, setLoadingAbsences] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Charger les informations du professeur
  useEffect(() => {
    let isMounted = true;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'teacher') {
      const token = localStorage.getItem('token');
      axios.get(`https://schoolapp.sp-p6.com/api/teachers/me?school_year=${schoolYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (isMounted) {
          setTeacher(res.data);
          console.log('Professeur connecté:', res.data);
        }
      })
      .catch(err => {
        if (isMounted) {
          setTeacher(null);
          console.error('Erreur lors de la récupération du professeur:', err);
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [schoolYear]);

  // Charger les matières du professeur
  useEffect(() => {
    let isMounted = true;
    
    if (teacher?.id) {
      console.log('Chargement des matières pour teacher.id =', teacher.id);
      fetchMySubjects();
    }
    
    return () => {
      isMounted = false;
    };
  }, [teacher?.id, schoolYear]);

  const fetchMySubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `https://schoolapp.sp-p6.com/api/teachers/${teacher?.id}/subjects?school_year=${schoolYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Matières récupérées:', data);
      setSubjects(data);
      
      // Sélectionner automatiquement la première matière si aucune n'est sélectionnée
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0].id);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des matières:', err);
      setSubjects([]);
    }
  };

  const handleSelectSubject = async (subject: Subject) => {
    setSelectedSubject(subject.id);
    setSelectedClass(null);
    setStudents([]);
    setGrades([]);
    setViewStep('classes');
    
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`https://schoolapp.sp-p6.com/api/teachers/${teacher?.id}/subjects/${subject.id}/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjectClasses(data);
    } catch (err) {
      console.error('Erreur lors du chargement des classes:', err);
      setSubjectClasses([]);
    }
  };

  const handleSelectClass = async (classe: Class) => {
    setSelectedClass(classe);
    setViewStep('students');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Token d\'authentification manquant', severity: 'error' });
        return;
      }

      if (!selectedSubject) {
        setSnackbar({ open: true, message: 'Aucune matière sélectionnée', severity: 'error' });
        return;
      }

      console.log('Chargement des données pour la classe:', classe.id, 'matière:', selectedSubject);

      const studentsPromise = axios.get(`https://schoolapp.sp-p6.com/api/classes/${classe.id}/students?school_year=${schoolYear}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      const gradesPromise = axios.get(`https://schoolapp.sp-p6.com/api/classes/${classe.id}/grades?subject_id=${selectedSubject}&school_year=${schoolYear}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      const absencesPromise = axios.get(`https://schoolapp.sp-p6.com/api/absences?class_id=${classe.id}&subject_id=${selectedSubject}&school_year=${schoolYear}&semester=${selectedTrimester}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const [studentsRes, gradesRes, absencesRes] = await Promise.all([studentsPromise, gradesPromise, absencesPromise]);

      console.log('Données chargées:', {
        students: studentsRes.data.length,
        grades: gradesRes.data.length,
        absences: absencesRes.data.length
      });

      setStudents(studentsRes.data);
      setGrades(gradesRes.data);
      setClassAbsences(absencesRes.data);

    } catch (err: any) {
      console.error('Erreur lors du chargement des données:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des élèves ou des notes';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      
      // Réinitialiser les données en cas d'erreur
      setStudents([]);
      setGrades([]);
      setClassAbsences([]);
    }
  };

  const handleOpenDialog = async (student: Student) => {
    setSelectedStudent(student);
    setGradeValue('');
    setSemester('1er trimestre');
    setAcademicYear(() => {
      const now = new Date();
      return `${now.getFullYear()}-${now.getFullYear() + 1}`;
    });
    setCoefficient(1);
    
    // S'assurer que selectedSubject est défini
    if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0].id);
    }
    
    setEditMode(false);
    setEditingGradeId(null);
    setStudentGradesSnapshot(grades.filter(g => g.student_id === student.id));
    setOpenDialog(true);
    setNoteTrimester(selectedTrimester);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddGrade = async () => {
    if (!selectedStudent || !selectedClass || !gradeValue || !selectedSubject) {
      setSnackbar({ open: true, message: 'Tous les champs sont obligatoires', severity: 'error' });
      return;
    }

    // Validation de la note
    const gradeNum = parseFloat(gradeValue);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) {
      setSnackbar({ open: true, message: 'La note doit être comprise entre 0 et 20', severity: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Token d\'authentification manquant', severity: 'error' });
        return;
      }

      const payload = {
        student_id: selectedStudent.id,
        class_id: selectedClass.id,
        grade: gradeNum,
        semester: noteTrimester,
        academic_year: schoolYear,
        coefficient: Number(coefficient) || 1,
        subject_id: selectedSubject
      };

      console.log('Payload pour ajout/modification de note:', payload);

      if (editMode && editingGradeId) {
        const response = await axios.put(
          `https://schoolapp.sp-p6.com/api/teachers/grades/${editingGradeId}`, 
          payload, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Note modifiée:', response.data);
        setSnackbar({ open: true, message: 'Note modifiée avec succès !', severity: 'success' });
      } else {
        const response = await axios.post(
          'https://schoolapp.sp-p6.com/api/teachers/grades', 
          payload, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Note ajoutée:', response.data);
        setSnackbar({ open: true, message: 'Note ajoutée avec succès !', severity: 'success' });
      }

      // Rafraîchir les données après ajout/modification
      if (selectedClass) {
        await handleSelectClass(selectedClass);
      }
      
      handleCloseDialog();
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout/modification de la note:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'ajout/modification de la note';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleEditGrade = (grade: Grade) => {
    setOpenDialog(true);
    setSelectedStudent(students.find(s => s.id === grade.student_id) || null);
    setEditMode(true);
    setEditingGradeId(grade.id);
    setGradeValue(grade.grade.toString());
    setSemester(grade.semester || '1er trimestre');
    setAcademicYear(grade.academic_year || (() => {
      const now = new Date();
      return `${now.getFullYear()}-${now.getFullYear() + 1}`;
    })());
    setCoefficient((grade as any).coefficient || 1);
    
    // S'assurer que selectedSubject est défini avec la matière de la note
    const gradeSubjectId = (grade as any).subject_id;
    if (gradeSubjectId) {
      setSelectedSubject(gradeSubjectId);
    } else if (subjects.length > 0) {
      setSelectedSubject(subjects[0].id);
    }
    setNoteTrimester(grade.semester || selectedTrimester);
  };

  const handleDeleteGrade = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Token d\'authentification manquant', severity: 'error' });
        return;
      }

      await axios.delete(`https://schoolapp.sp-p6.com/api/teachers/grades/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setSnackbar({ open: true, message: 'Note supprimée avec succès !', severity: 'success' });
      
      // Rafraîchir les données après suppression
      if (selectedClass) {
        await handleSelectClass(selectedClass);
      }
      
      handleCloseDialog();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la note:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression de la note';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const processedStudents = useMemo(() => {
    if (!students) return [];
    return students.map(student => {
      // Grouper les notes par trimestre
      const notesByTrim = trimestres.map(trim => {
        const studentGrades = grades.filter(
          g => g.student_id === student.id && g.semester === trim
        );
        const totalPoints = studentGrades.reduce((acc, n) => acc + n.grade * (n.coefficient || 1), 0);
        const totalCoefficients = studentGrades.reduce((acc, n) => acc + (n.coefficient || 1), 0);
        const moyenne = totalCoefficients > 0 ? totalPoints / totalCoefficients : null;
        return {
          trimestre: trim,
          notes: studentGrades,
          moyenne,
        };
      });
      const absenceCount = (() => {
        const filtered = classAbsences.filter(a =>
          String(a.student_id) === String(student.id) &&
          String(a.subject_id) === String(selectedSubject) &&
          a.semester && selectedTrimester &&
          a.semester.trim().toLowerCase() === selectedTrimester.trim().toLowerCase()
        );
        console.log('filtered:', filtered, 'absenceCount:', filtered.reduce((sum, current) => sum + (Number(current.duration_hours) || 0), 0), 'student:', student, 'selectedTrimester:', selectedTrimester, 'selectedSubject:', selectedSubject);
        return filtered.reduce((sum, current) => sum + (Number(current.duration_hours) || 0), 0);
      })();
      return { student, notesByTrim, absenceCount };
    });
  }, [students, grades, classAbsences]);

  const handleOpenNotif = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorNotif(event.currentTarget);
  };

  const handleCloseNotif = () => {
    setAnchorNotif(null);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleSendNotesToStudents = async () => {
    if (!selectedClass) return;
    setOpenConfirmStudents(true);
  };

  const confirmSendNotesToStudents = async () => {
    setOpenConfirmStudents(false);
    if (!selectedClass) return;
    const { id } = selectedClass;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://schoolapp.sp-p6.com/api/classes/${id}/notify-students`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: '✅ Les notifications ont bien été envoyées à tous les étudiants de la classe. Ils recevront une alerte avec leurs nouvelles notes.', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Erreur lors de la notification des étudiants.', severity: 'error' });
    }
  };

  const handleSendNotesToAdmin = async () => {
    if (!selectedClass) return;
    setOpenConfirmAdmin(true);
  };

  const confirmSendNotesToAdmin = async () => {
    setOpenConfirmAdmin(false);
    if (!selectedClass) return;
    const { id } = selectedClass;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://schoolapp.sp-p6.com/api/classes/${id}/submit-to-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: '✅ Les notes et moyennes de la classe ont bien été transmises à l\'administration. L\'équipe administrative pourra désormais établir les bulletins.', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Erreur lors de la transmission à l\'administration.', severity: 'error' });
    }
  };

  const handlePublishGrades = async () => {
    if (!selectedClass || !selectedSubject) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner une classe et une matière', severity: 'error' });
      return;
    }
    
    setPublishingGrades(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://schoolapp.sp-p6.com/api/teachers/publish-grades', {
        class_id: selectedClass.id,
        subject_id: selectedSubject,
        semester: selectedTrimester,
        school_year: schoolYear
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const affectedRows = response.data.affectedRows || 0;
      setSnackbar({ 
        open: true, 
        message: `✅ ${affectedRows} note(s) publiée(s) avec succès ! Les étudiants peuvent maintenant voir leurs notes.`, 
        severity: 'success' 
      });
      
      // Rafraîchir les notes pour mettre à jour l'affichage
      await handleSelectClass(selectedClass);
    } catch (err: any) {
      console.error('Erreur lors de la publication des notes:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Erreur lors de la publication des notes.', severity: 'error' });
    } finally {
      setPublishingGrades(false);
    }
  };

  // Ouvre la modale et initialise la liste des présences
  const handleOpenAbsenceDialog = () => {
    const initial: { [studentId: number]: { absent: boolean; reason: string; status: 'excused' | 'unexcused'; duration: number } } = {};
    students.forEach(s => {
      initial[s.id] = { absent: false, reason: '', status: 'unexcused', duration: 1 };
    });
    setAbsenceList(initial);
    setOpenAbsenceDialog(true);
  };

  // Gère le changement d'état d'absence pour un élève
  const handleAbsenceChange = (studentId: number, field: string, value: any) => {
    setAbsenceList(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  // Validation collective des absences
  const handleSubmitAbsences = async () => {
    const token = localStorage.getItem('token');
    const promises = Object.entries(absenceList)
      .filter(([_, v]) => v.absent)
      .map(([studentId, v]) =>
        axios.post('https://schoolapp.sp-p6.com/api/absences', {
          student_id: studentId,
          class_id: selectedClass?.id,
          subject_id: selectedSubject,
          teacher_id: teacher?.id,
          date: new Date().toISOString().slice(0, 10),
          reason: v.reason,
          status: v.status,
          duration_hours: v.duration,
          semester: selectedTrimester,
          school_year: schoolYear
        }, { headers: { Authorization: `Bearer ${token}` } })
      );
    await Promise.all(promises);
    setOpenAbsenceDialog(false);
    if (selectedClass) await handleSelectClass(selectedClass);
  };

  // Charger l'emploi du temps du professeur pour l'année scolaire sélectionnée
  useEffect(() => {
    if (!teacher?.id) return;
    setSchedule([]);
    setLoadingSchedule(true);
    const token = localStorage.getItem('token');
    axios.get(`https://schoolapp.sp-p6.com/api/teachers/${teacher.id}/teaching-schedule?school_year=${schoolYear}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setSchedule(res.data))
      .catch(err => {
        setSchedule([]);
        console.error('Erreur lors du chargement de l\'emploi du temps:', err);
      })
      .finally(() => setLoadingSchedule(false));
  }, [teacher?.id, schoolYear]);

  // Helpers pour l'année scolaire
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

  // Utilitaire pour formater l'heure ("08:00:00" → "08h00")
  function formatHour(time: string) {
    if (!time) return '';
    const [h, m] = time.split(':');
    return `${h}h${m}`;
  }
  // Utilitaire pour traduire les jours anglais en français
  const daysFr: Record<string, string> = {
    'Monday': 'Lundi', 'Tuesday': 'Mardi', 'Wednesday': 'Mercredi', 'Thursday': 'Jeudi', 'Friday': 'Vendredi', 'Saturday': 'Samedi', 'Sunday': 'Dimanche',
    'Lundi': 'Lundi', 'Mardi': 'Mardi', 'Mercredi': 'Mercredi', 'Jeudi': 'Jeudi', 'Vendredi': 'Vendredi', 'Samedi': 'Samedi', 'Dimanche': 'Dimanche'
  };

  // Utilitaire pour parser une note ou une moyenne
  const parseNote = (val: any) => {
    if (typeof val === 'string') {
      // Si c'est du type "14:00:00" ou "14:00"
      if (val.includes(':')) {
        return parseFloat(val.split(':')[0]);
      }
      // Si c'est du type "14h00"
      if (val.includes('h')) {
        return parseFloat(val.split('h')[0]);
      }
      return parseFloat(val.replace(',', '.'));
    }
    return Number(val);
  };

  // Ajout : rechargement des données à chaque changement de trimestre, matière ou classe
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      setLoadingAbsences(true);
      handleSelectClass(selectedClass).finally(() => setLoadingAbsences(false));
    }
    // eslint-disable-next-line
  }, [selectedTrimester, selectedSubject, selectedClass]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Box sx={{
        width: '100%',
        background: 'linear-gradient(45deg, #0d47a1 30%, #1976d2 90%)',
        color: 'white',
        py: 2,
        px: { xs: 2, md: 4 },
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1100
      }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <SchoolIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: 1, display: { xs: 'none', md: 'block' } }}>
            Espace Enseignant
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton color="inherit" onClick={handleOpenNotif} sx={{ position: 'relative' }}>
            <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
              <NotificationsIcon sx={{ color: 'white', fontSize: 28 }} />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(anchorNotif)}
            anchorEl={anchorNotif}
            onClose={handleCloseNotif}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: { xs: '90vw', sm: 350 }, maxWidth: 400, p: 2, borderRadius: 3 } }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Notifications</Typography>
              <Button size="small" onClick={handleMarkAllRead} disabled={unreadCount === 0}>Tout marquer lu</Button>
            </Box>
            {notifications.length === 0 && (
              <Typography color="text.secondary">Aucune notification.</Typography>
            )}
            <Stack spacing={1}>
              {notifications.map(n => (
                <Paper key={n.id} sx={{ p: 1.5, bgcolor: n.read ? '#f5f5f5' : '#e3f2fd', borderLeft: n.read ? '4px solid #bdbdbd' : '4px solid #1976d2', boxShadow: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight={700} fontSize={15}>{n.title}</Typography>
                      <Typography fontSize={14} color="text.secondary">{n.message}</Typography>
                      <Typography fontSize={12} color="text.disabled">{n.date.toLocaleString()}</Typography>
                    </Box>
                    {!n.read && (
                      <Button size="small" onClick={() => handleMarkRead(n.id)} sx={{ ml: 1 }}>Lu</Button>
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Popover>
          <Chip
            icon={<PersonIcon />}
            label={`${teacher?.first_name || ''} ${teacher?.last_name || ''}`}
            variant="filled"
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              fontWeight: 600,
              display: { xs: 'none', md: 'flex' }
            }}
          />
          <IconButton
            onClick={handleLogout}
            sx={{
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
            title="Déconnexion"
          >
            <LogoutIcon />
          </IconButton>
        </Stack>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel id="school-year-label">Année scolaire</InputLabel>
            <Select
              labelId="school-year-label"
              value={schoolYear}
              label="Année scolaire"
              onChange={e => {
                setSchoolYear(e.target.value);
                setViewStep('subjects');
                setSelectedClass(null);
                setStudents([]);
                setGrades([]);
                setClassAbsences([]);
              }}
            >
              {SCHOOL_YEARS.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loadingSchedule ? null : schedule.length === 0 ? (
          <Box sx={{ mt: 2, p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #fffde7 0%, #e3f2fd 100%)', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#d32f2f', fontWeight: 700, mb: 2 }}>
              Aucun emploi du temps n'est disponible pour cette année scolaire.
        </Typography>
            <Typography color="text.secondary">
              Veuillez vérifier l'année sélectionnée ou contacter l'administration si besoin.
            </Typography>
          </Box>
        ) : (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, mb: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)', boxShadow: '0 4px 24px 0 rgba(33, 150, 243, 0.10)' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <CalendarTodayIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>
                Mon emploi du temps <span style={{ fontWeight: 400, color: '#333', fontSize: 20 }}>({schoolYear})</span>
              </Typography>
            </Stack>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: 'none', mb: 2, background: 'rgba(255,255,255,0.85)' }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 80%, #d32f2f 100%)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18, borderTopLeftRadius: 12 }}>Classe</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Matière</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Jour</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Début</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18, borderTopRightRadius: 12 }}>Fin</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.map((row, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        backgroundColor: idx % 2 === 0 ? '#f7fbff' : '#ffffff',
                        '&:hover': { backgroundColor: '#e3f2fd' },
                        transition: 'background 0.2s',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>{row.class_name}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>{row.subject_name}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>{daysFr[row.day_of_week] || row.day_of_week}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>{formatHour(row.start_time)}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>{formatHour(row.end_time)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Si aucune matière ou classe, masquer tout le bloc */}
        {teacher && (teacher.subjects?.length === 0 || teacher.classes?.length === 0) ? (
          null
        ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 4, borderTop: '4px solid #1976d2' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <MenuBookIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>Vos matières</Typography>
              </Stack>
              <Stack spacing={1}>
                {subjects.map(subject => (
                  <Button
                    key={subject.id}
                    variant={selectedSubject === subject.id ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => handleSelectSubject(subject)}
                    sx={{
                      justifyContent: 'flex-start',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      bgcolor: selectedSubject === subject.id ? 'primary.main' : undefined,
                      color: selectedSubject === subject.id ? 'white' : 'inherit',
                      mb: 1
                    }}
                  >
                    {subject.name}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            {viewStep === 'classes' && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 4, borderTop: '4px solid #1976d2' }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <ApartmentIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Classes pour {subjects.find(s => s.id === selectedSubject)?.name}
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {subjectClasses.length > 0 ? (
                    subjectClasses.map((classe) => (
                      <Paper key={classe.id} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {classe.name}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          onClick={() => handleSelectClass({ id: classe.id, name: classe.name })}
                        >
                          Voir élèves / notes
                        </Button>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">Aucune classe trouvée pour cette matière.</Typography>
                  )}
                </Stack>
                <Button sx={{ mt: 2, fontWeight: 600 }} onClick={() => setViewStep('subjects')}>
                  RETOUR AUX MATIÈRES
                </Button>
              </Paper>
            )}
            {viewStep === 'students' && selectedClass && (
              loadingAbsences ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="primary">Chargement des absences...</Typography>
                </Box>
              ) : (
                <Paper elevation={4} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Classe : {selectedClass.name}
                      <Typography variant="body1" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({subjects.find(s => s.id === Number(selectedSubject))?.name})
                      </Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handlePublishGrades}
                        disabled={publishingGrades}
                        sx={{ fontWeight: 700, px: 2, py: 1, borderRadius: 2 }}
                      >
                        {publishingGrades ? 'Publication...' : 'Publier les notes du trimestre'}
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                      onClick={handleOpenAbsenceDialog}
                    >
                      GÉRER LES ABSENCES
                    </Button>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'center' }}>
                    {trimestres.map(trim => (
                      <Button
                        key={trim}
                        variant={selectedTrimester === trim ? 'contained' : 'outlined'}
                        color={selectedTrimester === trim ? 'primary' : 'inherit'}
                        onClick={() => setSelectedTrimester(trim)}
                        sx={{ fontWeight: 700, borderRadius: 2, minWidth: 160 }}
                      >
                        {trim}
                      </Button>
                    ))}
                  </Stack>
                  <TableContainer component={Paper} elevation={0} sx={{ mt: 1, mb: 2, border: 'none', borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(33, 150, 243, 0.08)' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 80%, #d32f2f 100%)' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18, borderTopLeftRadius: 12 }}>Élève</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{`Notes ${selectedTrimester}`}</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{`Moyenne ${selectedTrimester}`}</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>H. Absences</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: 18, borderTopRightRadius: 12 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {processedStudents.map((row, idx) => {
                          const trimIdx = trimestres.indexOf(selectedTrimester);
                          const { notes, moyenne } = row.notesByTrim[trimIdx];
                          console.log('DEBUG moyenne affichée', moyenne, typeof moyenne, row.student.first_name, row.student.last_name);
                          return (
                            <TableRow
                              key={row.student.id}
                              sx={{
                                backgroundColor: idx % 2 === 0 ? '#f7fbff' : '#ffffff',
                                '&:hover': { backgroundColor: '#e3f2fd' },
                                transition: 'background 0.2s',
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>
                                {row.student.first_name} {row.student.last_name}
                              </TableCell>
                              <TableCell>
                                {notes.length > 0 ? (
                                  <Box>
                                    {notes.map(n => (
                                      <span key={n.id} style={{ display: 'inline-block', marginRight: 8, marginBottom: 2 }}>
                                        <b style={{ color: '#1976d2' }}>{parseNote(n.grade).toFixed(2)}</b> (x{n.coefficient || 1}){' '}
                                        {!n.is_published && <Chip label="Non publié" size="small" color="warning" variant="outlined" sx={{ ml: 0.5, fontWeight: 600 }} />}
                                      </span>
                                    ))}
                                    <Box sx={{ mt: 1 }}>
                                      <Chip
                                        label={`${notes.filter(n => n.is_published).length}/${notes.length} publiées`}
                                        size="small"
                                        color={notes.filter(n => n.is_published).length === notes.length ? "success" : "warning"}
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                      />
                                    </Box>
                                  </Box>
                                ) : (
                                  <span style={{ color: '#bdbdbd' }}>-</span>
                                )}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, background: '#e3f2fd', color: moyenne != null ? '#1976d2' : '#bdbdbd', borderRadius: 2, fontSize: 16 }}>
                                {moyenne != null ? parseNote(moyenne).toFixed(2) : '-'}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: row.absenceCount > 0 ? '#d32f2f' : '#1976d2', fontSize: 16 }}>
                                {row.absenceCount > 0 ? `${row.absenceCount} h` : '-'}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="medium"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleOpenDialog(row.student)}
                                  startIcon={<span style={{ fontWeight: 'bold', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</span>}
                                  sx={{
                                    background: 'linear-gradient(90deg, #1976d2 0%, #43e97b 100%)',
                                    color: 'white',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    borderRadius: 3,
                                    boxShadow: '0 2px 8px 0 rgba(33,150,243,0.10)',
                                    px: 2.5,
                                    py: 1.2,
                                    fontSize: 15,
                                    letterSpacing: 1,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      background: 'linear-gradient(90deg, #1565c0 0%, #21cb7a 100%)',
                                      boxShadow: '0 4px 16px 0 rgba(33,150,243,0.18)',
                                      transform: 'translateY(-2px) scale(1.04)',
                                    },
                                    '& .MuiButton-startIcon': {
                                      marginRight: 1.2,
                                    },
                                  }}
                                >
                                  Ajouter une note
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button sx={{ mt: 2, fontWeight: 600 }} onClick={() => setViewStep('classes')}>
                    RETOUR AUX CLASSES
                  </Button>
                </Paper>
              )
            )}
          </Grid>
        </Grid>
        )}
      </Container>

      {/* Dialog pour ajouter/modifier les notes */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', fontSize: 22 }}>
          {editMode ? 'Modifier' : 'Ajouter'} une note pour {selectedStudent?.first_name}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#f5faff', borderRadius: 3, p: 3 }}>
          {studentGradesSnapshot.length > 0 && (
            <Box mb={2}>
              <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}>Notes existantes</Typography>
              {studentGradesSnapshot.map((g) => (
                <Paper key={g.id} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, bgcolor: '#f0f0f0', borderRadius: 2 }}>
                  <Typography>
                    Note: <b>{parseNote(g.grade).toFixed(2)}</b> | Coeff: {g.coefficient} | Semestre: {g.semester}
                  </Typography>
                  <Stack direction="row">
                    <Button size="small" onClick={() => handleEditGrade(g)} variant="outlined" sx={{ mr: 1 }}>Modifier</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteGrade(g.id)} variant="outlined">Supprimer</Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}
          <TextField
            label="Note"
            type="number"
            value={gradeValue}
            onChange={e => setGradeValue(e.target.value)}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
            inputProps={{ min: 0, max: 20, step: 0.5 }}
            helperText="Note entre 0 et 20"
          />
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Semestre</InputLabel>
            <Select
              value={noteTrimester}
              label="Semestre"
              onChange={e => setNoteTrimester(e.target.value)}
            >
              <MenuItem value="1er trimestre">1er trimestre</MenuItem>
              <MenuItem value="2e trimestre">2e trimestre</MenuItem>
              <MenuItem value="3e trimestre">3e trimestre</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Coefficient"
            type="number"
            value={coefficient}
            onChange={e => setCoefficient(parseInt(e.target.value) || 1)}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
            inputProps={{ min: 1, step: 1 }}
            helperText="Coefficient de la note (entier uniquement)"
          />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px', bgcolor: '#f5faff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
          <Button onClick={handleCloseDialog} variant="outlined">Annuler</Button>
          <Button onClick={handleAddGrade} variant="contained" color="primary" sx={{ fontWeight: 700 }}>
            {editMode ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmStudents} onClose={() => setOpenConfirmStudents(false)}>
        <DialogTitle>Confirmer l'envoi</DialogTitle>
        <DialogContent>
          Voulez-vous vraiment notifier les étudiants de la classe de leurs nouvelles notes ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmStudents(false)}>Annuler</Button>
          <Button onClick={confirmSendNotesToStudents} variant="contained" color="primary">Confirmer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmAdmin} onClose={() => setOpenConfirmAdmin(false)}>
        <DialogTitle>Confirmer la transmission</DialogTitle>
        <DialogContent>
          Voulez-vous vraiment transmettre toutes les notes et moyennes de la classe à l'administration pour le bulletin ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmAdmin(false)}>Annuler</Button>
          <Button onClick={confirmSendNotesToAdmin} variant="contained" color="error">Confirmer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAbsenceDialog} onClose={() => setOpenAbsenceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Gestion des absences - {selectedClass?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Trimestre</InputLabel>
            <Select
              value={selectedTrimester}
              label="Trimestre"
              onChange={e => setSelectedTrimester(e.target.value)}
            >
              <MenuItem value="1er trimestre">1er trimestre</MenuItem>
              <MenuItem value="2e trimestre">2e trimestre</MenuItem>
              <MenuItem value="3e trimestre">3e trimestre</MenuItem>
            </Select>
          </FormControl>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Élève</TableCell>
                <TableCell>Absent</TableCell>
                <TableCell>Raison</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Durée (h)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.first_name} {s.last_name}</TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={absenceList[s.id]?.absent || false}
                      onChange={e => handleAbsenceChange(s.id, 'absent', e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={absenceList[s.id]?.reason || ''}
                      onChange={e => handleAbsenceChange(s.id, 'reason', e.target.value)}
                      disabled={!absenceList[s.id]?.absent}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={absenceList[s.id]?.status || 'unexcused'}
                      onChange={e => handleAbsenceChange(s.id, 'status', e.target.value)}
                      disabled={!absenceList[s.id]?.absent}
                      size="small"
                    >
                      <MenuItem value="unexcused">Non justifiée</MenuItem>
                      <MenuItem value="excused">Justifiée</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={absenceList[s.id]?.duration || 1}
                      onChange={e => handleAbsenceChange(s.id, 'duration', Number(e.target.value))}
                      disabled={!absenceList[s.id]?.absent}
                      size="small"
                      inputProps={{ min: 1, max: 8 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAbsenceDialog(false)}>Annuler</Button>
          <Button variant="contained" color="primary" onClick={handleSubmitAbsences}>
            Enregistrer les absences
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherDashboard;
