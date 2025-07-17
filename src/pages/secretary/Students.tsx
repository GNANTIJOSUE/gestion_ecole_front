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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
  Tooltip,
  useTheme,
  Fade,
  Zoom,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MonetizationOn as MonetizationOnIcon,
  Print as PrintIcon,
  School as SchoolIcon,
  Check as CheckIcon,
  Payment as PaymentIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import SecretarySidebar from '../../components/SecretarySidebar';
import { useNavigate } from 'react-router-dom';
import InscrptionPre from '../InscrptionPre';
import { blue, green, orange, purple } from '@mui/material/colors';
import axios from 'axios';


const genreOptions = ['Tous', 'Masculin', 'Féminin'];

const Students = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Toutes les classes');
  const [scolariteFilter, setScolariteFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('Tous');
  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // State pour la modale de paiement
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [studentToPay, setStudentToPay] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentReceiptData, setPaymentReceiptData] = useState<any | null>(null);
  const [showPaymentReceipt, setShowPaymentReceipt] = useState(false);
  const paymentReceiptRef = useRef<HTMLDivElement>(null);

  // State pour la modale de finalisation
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [finalizeClassId, setFinalizeClassId] = useState('');
  const [finalizePayment, setFinalizePayment] = useState('');
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // State pour les classes
  const [classes, setClasses] = useState<{ id: number; name: string; level?: string; amount?: number | string }[]>([]);

  // Réinscription
  const [reinscriptionOpen, setReinscriptionOpen] = useState(false);
  const [matriculeSearch, setMatriculeSearch] = useState('');
  const [reinscriptionStudent, setReinscriptionStudent] = useState<any | null>(null);
  const [reinscriptionError, setReinscriptionError] = useState<string | null>(null);
  const [reinscriptionLoading, setReinscriptionLoading] = useState(false);
  const [reinscriptionClassId, setReinscriptionClassId] = useState('');
  const [reinscriptionPayment, setReinscriptionPayment] = useState('');
  const [reinscriptionSubmitting, setReinscriptionSubmitting] = useState(false);
  // Ajout pour édition parent
  const [parentFields, setParentFields] = useState({
    parent_first_name: '',
    parent_last_name: '',
    parent_phone: '',
    parent_email: '',
    parent_contact: ''
  });
  // Ajout pour message d'erreur API réinscription
  const [reinscriptionApiError, setReinscriptionApiError] = useState<string | null>(null);

  // Année scolaire
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // Ajout pour le niveau suivant et admission
  const niveaux = ["6ème", "5ème", "4ème", "3ème", "Seconde", "Première", "Terminale"];
  const [annualAverage, setAnnualAverage] = useState<{ moyenne_annuelle: number, rank: number, total: number, isAdmis: boolean } | null>(null);
  const [nextLevel, setNextLevel] = useState<string>("");
  const [targetLevel, setTargetLevel] = useState<string>("");

  // Utilitaire pour obtenir l'année scolaire courante
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
  // Ajout des useState manquants pour la gestion du reliquat année précédente (dans le composant)
  const [previousYearDue, setPreviousYearDue] = useState(0);
  const [previousYearPayment, setPreviousYearPayment] = useState('');
  // Fonction utilitaire pour obtenir l'année scolaire précédente
  function getPreviousSchoolYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let previousSchoolYear = '';
    if (month >= 9) {
      previousSchoolYear = `${year - 1}-${year}`;
    } else {
      previousSchoolYear = `${year - 2}-${year - 1}`;
    }
    return previousSchoolYear;
  }

  // Ajout d'un état pour l'erreur de montant
  const [paymentAmountError, setPaymentAmountError] = useState<string>("");

  // Ajout pour reçu de réinscription
  const [reinscriptionReceiptData, setReinscriptionReceiptData] = useState<any | null>(null);
  const [showReinscriptionReceipt, setShowReinscriptionReceipt] = useState(false);
  const reinscriptionReceiptRef = useRef<HTMLDivElement>(null);

  // Ajout des states
  const [showFinalizeForm, setShowFinalizeForm] = useState(false);
  const [studentToFinalize, setStudentToFinalize] = useState<any | null>(null);

  // Ajout des états pour la classe précédente et son niveau
  const [previousClass, setPreviousClass] = useState('');
  const [previousLevel, setPreviousLevel] = useState('');

  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClassChange = (event: any) => {
    setSelectedClass(event.target.value);
    setPage(0);
  };

  const handleScolariteFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScolariteFilter(event.target.value);
    setPage(0);
  };

  const handleGenreFilterChange = (event: SelectChangeEvent) => {
    setGenreFilter(event.target.value);
    setPage(0);
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const printContents = tableRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=900');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Liste des élèves</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background:#1976d2;color:#fff;} .success{color:green;} .error{color:red;} </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h2>Liste des élèves</h2>');
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

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://schoolapp.sp-p6.com/api/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { school_year: schoolYear }
      });
      setStudents(res.data);
      // Log pour debug
      console.log('Données reçues du backend:', res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des étudiants');
      // Log pour debug
      console.error('Erreur dans fetchStudents:', err);
    } finally {
      setLoading(false);
    }
  }, [schoolYear]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://schoolapp.sp-p6.com/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data.map((c: any) => ({ ...c, level: c.level || '' })));
    } catch (err) {
      console.error("Erreur lors de la récupération des classes", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        await fetchStudents();
        await fetchClasses();
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchStudents]);

  // Ajoute la fonction utilitaire pour générer les 5 dernières années scolaires
  function getSchoolYears(count = 5) {
    const now = new Date();
    const currentYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    return Array.from({ length: count }, (_, i) => {
      const start = currentYear - (count - 1 - i);
      return `${start}-${start + 1}`;
    }).reverse();
  }
  // Remplace le useEffect qui déduisait les années à partir des élèves
  useEffect(() => {
    setAvailableYears(getSchoolYears(5));
  }, []);

  // Modifie le fetch des élèves pour inclure l'année scolaire
  useEffect(() => {
    fetchStudents();
  }, [schoolYear, fetchStudents]);

  // Afficher tous les étudiants inscrits pour l'année en cours (présentiel et en ligne)
  const filteredStudents = students.filter((student) => {
    const matchClass = selectedClass === 'Toutes les classes' || student.classe === selectedClass;
    const matchSearch =
      (student.registration_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.first_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const scolariteDue = (student.class_amount || 0) - (student.total_discount || 0);
    const matchScolarite = scolariteFilter === '' || scolariteDue === parseInt(scolariteFilter);
    const matchGenre = genreFilter === 'Tous' || (student.gender === 'Masculin' && genreFilter === 'Masculin') || (student.gender === 'Féminin' && genreFilter === 'Féminin');
    return matchClass && matchSearch && matchScolarite && matchGenre;
  });

  // Log filteredStudents juste avant le rendu du tableau
  console.log('filteredStudents:', filteredStudents);

  // Suppression
  const handleDelete = async (studentId: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet étudiant ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://schoolapp.sp-p6.com/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchStudents();
      } catch (err: any) {
        alert(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
        console.error('Erreur lors de la suppression:', err.response?.data || err);
      }
    }
  };

  // Edition
  const handleEditOpen = (student: any) => {
    setEditStudent({ ...student });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditStudent(null);
    setEditSuccess(null);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditStudent((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditSubmit = async () => {
    if (!editStudent) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        first_name: editStudent.first_name,
        last_name: editStudent.last_name,
        date_of_birth: editStudent.date_of_birth,
        gender: editStudent.gender,
        address: editStudent.address,
        city: editStudent.city,
        phone: editStudent.phone,
        previous_school: editStudent.previous_school,
        previous_class: editStudent.previous_class,
        special_needs: editStudent.special_needs,
        additional_info: editStudent.additional_info,
        class_id: editStudent.class_id || null
      };
      await axios.put(`http://schoolapp.sp-p6.com/api/students/${editStudent.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditSuccess('Modification enregistrée avec succès !');
      fetchStudents();
      setTimeout(() => {
        setEditSuccess(null);
        handleEditClose();
      }, 1500);
    } catch (err: any) {
      alert('Erreur lors de la modification');
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  // Fonctions pour la modale de paiement
  const handlePaymentOpen = (student: any) => {
    setStudentToPay({
      ...student,
      class_amount: student.class_amount ?? 0,
      total_paid: student.total_paid ?? 0,
      total_discount: student.total_discount ?? 0,
    });
    setPaymentModalOpen(true);
    setPaymentAmount("");
    setPaymentAmountError("");
  };
  const handlePaymentClose = () => {
    setPaymentModalOpen(false);
    setStudentToPay(null);
    setPaymentAmount('');
  };

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPaymentAmount(value);
    if (studentToPay) {
      const totalDue = studentToPay.class_amount ?? 0;
      const totalPaid = studentToPay.total_paid ?? 0;
      const remaining = totalDue - totalPaid;
      if (Number(value) > remaining) {
        setPaymentAmountError('Le montant versé ne peut pas être supérieur au montant restant de la scolarité.');
      } else {
        setPaymentAmountError("");
      }
    }
  };

  const handlePaymentSubmit = async () => {
    if (!studentToPay || !paymentAmount || Number(paymentAmount) <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }
    // Empêcher un paiement supérieur au montant dû
    const totalDue = studentToPay.class_amount ?? 0;
    const totalPaid = studentToPay.total_paid ?? 0;
    const remaining = totalDue - totalPaid;
    if (Number(paymentAmount) > remaining) {
      alert('Le montant versé ne peut pas être supérieur au montant restant de la scolarité.');
      return;
    }
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log({
        student_id: studentToPay.id,
        amount: Number(paymentAmount),
        school_year: schoolYear,
        payment_method: 'cash',
      });
      const { data } = await axios.post(`http://schoolapp.sp-p6.com/api/payments`, {
        student_id: studentToPay.id,
        amount: Number(paymentAmount),
        school_year: schoolYear,
        payment_method: 'cash',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentReceiptData(data.receiptData);
      setShowPaymentReceipt(true);
      handlePaymentClose();
      fetchStudents(); // Rafraîchir la liste en arrière-plan
    } catch (err: any) {
      console.error('Erreur lors du paiement:', err);
      alert(err.response?.data?.message || 'Erreur lors du paiement.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handler Finaliser
  const handleFinalizeOpen = (student: any) => {
    console.log('handleFinalizeOpen appelé avec:', student);
    console.log('registration_mode:', student.registration_mode);
    console.log('isToFinalize:', student.registration_mode === 'online');
    
    if (student.registration_mode === 'online') {
      console.log('Étudiant en ligne détecté, ouverture du formulaire complet');
      setStudentToFinalize(student);
      setShowFinalizeForm(true);
      setFinalizeModalOpen(false); // Masquer la modale rapide
    } else {
      console.log('Étudiant présentiel, ouverture de la modale rapide');
      setStudentToFinalize(student);
      setShowFinalizeForm(false);
      setFinalizeModalOpen(true);
    }
  };

  const handleFinalizeClose = () => {
    setFinalizeModalOpen(false);
    setShowFinalizeForm(false);
    setReinscriptionStudent(null);
    setStudentToFinalize(null);
    setFinalizeClassId('');
    setFinalizePayment('');
    setReceiptData(null);
    setShowReceipt(false);
  };

  const handleFinalizeSubmit = async () => {
    const student = studentToFinalize;
    if (!student || !finalizeClassId || !finalizePayment) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    setFinalizeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`http://schoolapp.sp-p6.com/api/students/${student.id}/finalize`, {
        class_id: finalizeClassId,
        payment_amount: finalizePayment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Réponse du backend après finalisation:', data);

      // Correction : comparer les IDs en string pour éviter NaN
      const finalizedClass = classes.find(c => String(c.id) === String(finalizeClassId));
      console.log('finalizedClass:', finalizedClass, 'amount:', finalizedClass?.amount, 'type:', typeof finalizedClass?.amount);
      
      const classAmount = finalizedClass && finalizedClass.amount != null
        ? Number(finalizedClass.amount)
        : null;
      console.log('classAmount après conversion:', classAmount, 'type:', typeof classAmount);
      
      const paymentAmount = Number(finalizePayment);
      const resteAPayer = classAmount !== null && !isNaN(classAmount) ? classAmount - paymentAmount : null;
      const newReceiptData = {
        ...student,
        student_code: data.student_code,
        parent_code: data.parent_code,
        classe: finalizedClass?.name,
        payment_amount: finalizePayment,
        class_amount: classAmount,
        reste_a_payer: resteAPayer,
        date: new Date().toLocaleDateString('fr-FR')
      };

      console.log('Données du reçu préparées:', newReceiptData);

      setReceiptData(newReceiptData);
      setShowReceipt(true);
      // Ne pas fermer la modale ici, la fermer seulement après fermeture du reçu
      fetchStudents(); // Refresh the list
    } catch (err) {
      alert('Erreur lors de la finalisation.');
    } finally {
      setFinalizeLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const printContent = receiptRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank', 'height=700,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Reçu d\'Inscription</title>');
        printWindow.document.write(`
            <style>
                body { font-family: 'Arial', sans-serif; margin: 20px; color: #333; }
                .receipt-container { border: 1px solid #eee; padding: 30px; width: 100%; max-width: 650px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; }
                .header h2 { margin: 0; color: #1976d2; }
                .header p { margin: 5px 0 0; }
                .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px; margin-bottom: 30px;}
                .content-grid p { margin: 5px 0; font-size: 1.1em; }
                .content-grid .label { font-weight: bold; color: #555; }
                .content-grid .value { font-weight: bold; color: #1976d2; }
                .footer { text-align: center; margin-top: 40px; font-style: italic; font-size: 0.9em; color: #777; }
                .total { font-size: 1.3em; font-weight: bold; margin-top: 30px; text-align: right; color: #333; }
                .school-stamp { text-align: right; margin-top: 50px; }
                .school-stamp p { margin: 0; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
      }
    }
  };

  // Réinscription
  const handleReinscriptionOpen = () => {
    setReinscriptionOpen(true);
    setMatriculeSearch('');
    setReinscriptionStudent(null);
    setReinscriptionError(null);
    setReinscriptionClassId('');
    setReinscriptionPayment('');
    setReinscriptionApiError(null); // reset
  };
  const handleReinscriptionClose = () => {
    setReinscriptionOpen(false);
    setMatriculeSearch('');
    setReinscriptionStudent(null);
    setReinscriptionError(null);
    setReinscriptionClassId('');
    setReinscriptionPayment('');
    setReinscriptionApiError(null); // reset
  };
  const handleMatriculeSearch = async () => {
    setReinscriptionLoading(true);
    setReinscriptionError(null);
    setReinscriptionStudent(null);
    setPreviousYearDue(0); // reset
    setPreviousYearPayment(''); // reset
    setPreviousClass(''); // reset
    setPreviousLevel(''); // reset
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://schoolapp.sp-p6.com/api/students?registration_number=${matriculeSearch}`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (data && data.length > 0) {
        setReinscriptionStudent(data[0]);
        // Récupérer le total dû et payé de l'année précédente
        const prevYear = getPreviousSchoolYear();
        const [enrollmentsRes, paymentsRes] = await Promise.all([
          axios.get(`http://schoolapp.sp-p6.com/api/students/${data[0].id}/classes?school_year=${prevYear}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://schoolapp.sp-p6.com/api/students/${data[0].id}/payments?school_year=${prevYear}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        let totalDue = 0;
        if (enrollmentsRes.data && enrollmentsRes.data.length > 0) {
          setPreviousClass(enrollmentsRes.data[0].name || '');
          // Trouver le niveau de la classe précédente dans la liste des classes
          const prevClassObj = classes.find(c => c.name === enrollmentsRes.data[0].name);
          setPreviousLevel(prevClassObj?.level || '');
          totalDue = enrollmentsRes.data[0].amount || 0;
        } else {
          setPreviousClass('');
          setPreviousLevel('');
        }
        let totalPaid = 0;
        if (paymentsRes.data && paymentsRes.data.length > 0) {
          totalPaid = paymentsRes.data.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
        }
        setPreviousYearDue(Math.max(totalDue - totalPaid, 0));
      } else {
        setReinscriptionError("Désolé, ce matricule n'existe pas dans la base de données.");
      }
    } catch {
      setReinscriptionError('Erreur lors de la recherche du matricule.');
    }
    setReinscriptionLoading(false);
  };
  const handleParentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParentFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleReinscriptionSubmit = async () => {
    if (!reinscriptionStudent || !reinscriptionClassId || !reinscriptionPayment) {
      setReinscriptionApiError('Veuillez remplir tous les champs.');
      return;
    }
    setReinscriptionSubmitting(true);
    setReinscriptionApiError(null);
    try {
      const token = localStorage.getItem('token');
      // Si reliquat à payer, enregistrer d'abord le paiement du reliquat
      if (previousYearDue > 0) {
        if (!previousYearPayment || Number(previousYearPayment) < previousYearDue) {
          setReinscriptionApiError('Veuillez régler le reliquat de l\'année précédente.');
          setReinscriptionSubmitting(false);
          return;
        }
        // Paiement du reliquat
        await axios.post(`http://schoolapp.sp-p6.com/api/payments`, {
          student_id: reinscriptionStudent.id,
          amount: previousYearPayment,
          school_year: getPreviousSchoolYear(),
          payment_method: 'cash',
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      // Réinscription pour la nouvelle année
      const { data } = await axios.post(`http://schoolapp.sp-p6.com/api/students/${reinscriptionStudent.id}/reinscription`, {
        class_id: reinscriptionClassId,
        payment_amount: reinscriptionPayment,
        school_year: schoolYear,
        payment_method: 'cash',
        ...parentFields
      }, { headers: { Authorization: `Bearer ${token}` } });
      // Préparer les données du reçu
      const classeObj = classes.find(c => c.id === parseInt(reinscriptionClassId));
      const receipt = {
        ...reinscriptionStudent,
        parent: { ...parentFields },
        classe: classeObj?.name || '',
        payment_amount: reinscriptionPayment,
        schoolYear: schoolYear,
        date: new Date().toLocaleString('fr-FR'),
        student_code: data.student_code,
        parent_code: data.parent_code
      };
      setReinscriptionReceiptData(receipt);
      setShowReinscriptionReceipt(true);
      handleReinscriptionClose();
      fetchStudents();
      // alert('Réinscription effectuée avec succès !'); // Remplacé par le reçu
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setReinscriptionApiError(err.response.data.message);
      } else {
        setReinscriptionApiError('Erreur lors de la réinscription ou du paiement du reliquat.');
      }
    }
    setReinscriptionSubmitting(false);
  };

  // Quand on trouve l'élève, préremplir les champs parent
  useEffect(() => {
    if (reinscriptionStudent) {
      setParentFields({
        parent_first_name: reinscriptionStudent.parent_first_name || '',
        parent_last_name: reinscriptionStudent.parent_last_name || '',
        parent_phone: reinscriptionStudent.parent_phone || '',
        parent_email: reinscriptionStudent.parent_email || '',
        parent_contact: reinscriptionStudent.parent_contact || ''
      });
    }
  }, [reinscriptionStudent]);

  // Récupérer la moyenne annuelle et admission à chaque recherche d'élève
  useEffect(() => {
    const fetchAnnualAverage = async () => {
      if (reinscriptionStudent) {
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get(`http://schoolapp.sp-p6.com/api/students/${reinscriptionStudent.id}/annual-average`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Admis si moyenne >= 10
          setAnnualAverage({ ...data, isAdmis: data.moyenne_annuelle >= 10 });
        } catch {
          setAnnualAverage(null);
        }
      } else {
        setAnnualAverage(null);
      }
    };
    fetchAnnualAverage();
  }, [reinscriptionStudent]);

  // Calcul du niveau cible pour la réinscription à partir du niveau de la classe précédente
  useEffect(() => {
    if (previousLevel && annualAverage) {
      const index = niveaux.findIndex(n => n.toLowerCase() === previousLevel.toLowerCase());
      let target = previousLevel;
      if (annualAverage.isAdmis && index >= 0 && index < niveaux.length - 1) {
        target = niveaux[index + 1];
      }
      setTargetLevel(target);
    } else {
      setTargetLevel('');
    }
  }, [previousLevel, annualAverage]);

  // Filtrer les classes du niveau cible (redoublement ou passage)
  const classesNiveauCible = targetLevel ? classes.filter(c => c.level && c.level.toLowerCase() === targetLevel.toLowerCase()) : classes;

  // Impression du reçu de paiement
  const handlePrintPaymentReceipt = () => {
    const printContent = paymentReceiptRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank', 'height=700,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Reçu de Paiement</title>');
        printWindow.document.write(`
            <style>
                body { font-family: 'Arial', sans-serif; margin: 20px; color: #333; }
                .receipt-container { border: 1px solid #1976d2; padding: 30px; width: 100%; max-width: 650px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
                .header { text-align: center; border-bottom: 2px solid #1976d2; padding-bottom: 10px; margin-bottom: 30px; }
                .header h2 { margin: 0; color: #1976d2; }
                .header p { margin: 5px 0 0; }
                .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px; margin-bottom: 30px;}
                .content-grid p { margin: 5px 0; font-size: 1.1em; }
                .content-grid .label { font-weight: bold; color: #555; }
                .content-grid .value { font-weight: bold; color: #1976d2; }
                .footer { text-align: center; margin-top: 40px; font-style: italic; font-size: 0.9em; color: #777; }
                .total { font-size: 1.3em; font-weight: bold; margin-top: 30px; text-align: right; color: #333; }
                .school-stamp { text-align: right; margin-top: 50px; }
                .school-stamp p { margin: 0; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
      }
    }
  };

  // Impression du reçu de réinscription
  const handlePrintReinscriptionReceipt = () => {
    const printContent = reinscriptionReceiptRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank', 'height=700,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Reçu de Réinscription</title>');
        printWindow.document.write(`
            <style>
                body { font-family: 'Arial', sans-serif; margin: 20px; color: #333; }
                .receipt-container { border: 1px solid #1976d2; padding: 30px; width: 100%; max-width: 650px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
                .header { text-align: center; border-bottom: 2px solid #1976d2; padding-bottom: 10px; margin-bottom: 30px; }
                .header h2 { margin: 0; color: #1976d2; }
                .header p { margin: 5px 0 0; }
                .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px; margin-bottom: 30px;}
                .content-grid p { margin: 5px 0; font-size: 1.1em; }
                .content-grid .label { font-weight: bold; color: #555; }
                .content-grid .value { font-weight: bold; color: #1976d2; }
                .footer { text-align: center; margin-top: 40px; font-style: italic; font-size: 0.9em; color: #777; }
                .total { font-size: 1.3em; font-weight: bold; margin-top: 30px; text-align: right; color: #333; }
                .school-stamp { text-align: right; margin-top: 50px; }
                .school-stamp p { margin: 0; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
      }
    }
  };

  const handleShowReceipt = async (paymentId: number | string) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://schoolapp.sp-p6.com/api/payments/${paymentId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentReceiptData(data);
      setShowPaymentReceipt(true);
    } catch (err) {
      alert('Erreur lors de la récupération du reçu.');
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
          {/* Sélecteur d'année scolaire */}
          <Box sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="school-year-label">Année scolaire</InputLabel>
              <Select
                labelId="school-year-label"
                value={schoolYear}
                label="Année scolaire"
                onChange={e => setSchoolYear(e.target.value)}
              >
                {availableYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {showRegistrationForm ? (
            <InscrptionPre onClose={() => {
              setShowRegistrationForm(false);
              fetchStudents();
            }} />
          ) : (
            <>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SchoolIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  <Typography variant="h4" component="h1" sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Gestion des Étudiants
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowRegistrationForm(true)}
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
                    Nouvel Étudiant
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ReplayIcon />}
                    onClick={handleReinscriptionOpen}
                    sx={{
                      background: `linear-gradient(45deg, ${purple[500]} 30%, ${purple[700]} 90%)`,
                      color: 'white',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${purple[600]} 30%, ${purple[800]} 90%)`,
                      },
                      px: 3,
                      py: 1,
                    }}
                  >
                    Réinscription
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
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Rechercher un étudiant..."
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
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Classe</InputLabel>
                        <Select
                          value={selectedClass}
                          onChange={handleClassChange}
                          label="Classe"
                          sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          <MenuItem value="Toutes les classes">Toutes les classes</MenuItem>
                          {classes.map((classe) => (
                            <MenuItem key={classe.id} value={classe.name}>{classe.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Genre</InputLabel>
                        <Select
                          value={genreFilter}
                          onChange={handleGenreFilterChange}
                          label="Genre"
                          sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          {genreOptions.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Montant dû (F CFA)"
                        type="number"
                        value={scolariteFilter}
                        onChange={handleScolariteFilterChange}
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
                </CardContent>
              </Card>

              <div ref={tableRef}>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)` }}>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Matricule</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nom</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Prénom</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Genre</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Classe</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Statut</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Scolarité due (F CFA)</TableCell>
                          <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading && (
                          <TableRow>
                            <TableCell colSpan={8} align="center">Chargement...</TableCell>
                          </TableRow>
                        )}
                        {error && (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ color: 'error.main' }}>{error}</TableCell>
                          </TableRow>
                        )}
                        {filteredStudents
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((student) => {
                            const remaining = (student.class_amount || 0) - (student.total_discount || 0) - (student.total_paid || 0);
                            const isToFinalize = student.registration_mode === 'online' || student.registration_status === 'online' || !student.classe;
                            
                            // Log pour debug
                            console.log('Étudiant:', student.registration_number, 'registration_mode:', student.registration_mode, 'isToFinalize:', isToFinalize);
                            
                            return (
                              <Zoom in key={student.id}>
                                <TableRow hover>
                                  <TableCell>{student.registration_number}</TableCell>
                                  <TableCell>{student.last_name}</TableCell>
                                  <TableCell>{student.first_name}</TableCell>
                                  <TableCell>{student.gender}</TableCell>
                                  <TableCell>
                                    {student.classe ? (
                                      <Chip label={student.classe} color="primary" size="small" />
                                    ) : (
                                      <Chip label="Non assigné" size="small" />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {isToFinalize ? null : (
                                      <Chip
                                        label={remaining > 0 ? 'Non soldé' : 'Soldé'}
                                        color={remaining > 0 ? 'error' : 'success'}
                                        size="small"
                                        sx={{ fontWeight: 600, '& .MuiChip-label': { px: 2 } }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography sx={{ color: remaining > 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                                      {remaining.toLocaleString('fr-FR')} F CFA
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    {isToFinalize ? (
                                      <Tooltip title="Finaliser l'inscription">
                                        <Button
                                          variant="contained"
                                          color="secondary"
                                          size="small"
                                          onClick={() => handleFinalizeOpen(student)}
                                          startIcon={<CheckIcon />}
                                        >
                                          Finaliser
                                        </Button>
                                      </Tooltip>
                                    ) : (
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                        {remaining > 0 &&
                                          <Tooltip title="Effectuer un versement">
                                            <Button
                                              variant="contained"
                                              color="success"
                                              size="small"
                                              onClick={() => handlePaymentOpen(student)}
                                            >
                                              Payer
                                            </Button>
                                          </Tooltip>
                                        }
                                        <Tooltip title="Voir détails">
                                          <IconButton color="primary" size="small" onClick={() => navigate(`/secretary/students/${student.id}`)}>
                                            <VisibilityIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                          <IconButton color="primary" size="small" onClick={() => handleEditOpen(student)}><EditIcon /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                          <IconButton color="error" size="small" onClick={() => handleDelete(student.id)}><DeleteIcon /></IconButton>
                                        </Tooltip>
                                      </Box>
                                    )}
                                  </TableCell>
                                </TableRow>
                              </Zoom>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredStudents.length}
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

              {/* Modale d'édition */}
              <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
                <DialogTitle>Modifier l'étudiant</DialogTitle>
                <DialogContent>
                  {editSuccess ? (
                    <Box sx={{ mb: 2, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="success.main" sx={{ fontWeight: 'bold', fontSize: 18 }}>{editSuccess}</Typography>
                    </Box>
                  ) : (
                    editStudent && (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Prénom"
                            name="first_name"
                            value={editStudent.first_name || editStudent.nom || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nom"
                            name="last_name"
                            value={editStudent.last_name || editStudent.prenom || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Date de naissance"
                            name="date_of_birth"
                            value={editStudent.date_of_birth || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id="edit-gender-label">Genre</InputLabel>
                            <Select
                              labelId="edit-gender-label"
                              name="gender"
                              value={editStudent.gender || ''}
                              label="Genre"
                              onChange={(e) => setEditStudent((prev: any) => ({ ...prev, gender: e.target.value }))}
                            >
                              <MenuItem value="M">Masculin</MenuItem>
                              <MenuItem value="F">Féminin</MenuItem>
                              <MenuItem value="Other">Autre</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Adresse"
                            name="address"
                            value={editStudent.address || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Ville"
                            name="city"
                            value={editStudent.city || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Téléphone"
                            name="phone"
                            value={editStudent.phone || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="École précédente"
                            name="previous_school"
                            value={editStudent.previous_school || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Classe précédente"
                            name="previous_class"
                            value={editStudent.previous_class || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Classe</InputLabel>
                            <Select
                              name="class_id"
                              value={editStudent.class_id || ''}
                              label="Classe"
                              onChange={(e) => setEditStudent((prev: any) => ({ ...prev, class_id: e.target.value }))}
                            >
                              <MenuItem value="">
                                <em>Non assigné</em>
                              </MenuItem>
                              {classes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Besoins particuliers"
                            name="special_needs"
                            value={editStudent.special_needs || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Informations supplémentaires"
                            name="additional_info"
                            value={editStudent.additional_info || ''}
                            onChange={handleEditChange}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    )
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleEditClose} color="secondary">Fermer</Button>
                  {!editSuccess && (
                    <Button onClick={handleEditSubmit} color="primary" variant="contained" disabled={editLoading}>
                      {editLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  )}
                </DialogActions>
              </Dialog>

              {/* Modale de Paiement */}
              <Dialog open={paymentModalOpen} onClose={handlePaymentClose} maxWidth="sm" fullWidth>
                <DialogTitle>Effectuer un Paiement</DialogTitle>
                <DialogContent>
                  {studentToPay && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6">{`${studentToPay.first_name} ${studentToPay.last_name}`}</Typography>
                      <Typography color="text.secondary" gutterBottom>Matricule: {studentToPay.registration_number}</Typography>
                       <Typography color="error" sx={{mt: 2}}>
                        Reste à payer: <b>{(((studentToPay?.class_amount ?? 0) - (studentToPay?.total_discount ?? 0) - (studentToPay?.total_paid ?? 0)).toLocaleString('fr-FR'))} F CFA</b>
                      </Typography>
                      
                      <TextField
                        label="Montant du versement"
                        type="number"
                        fullWidth
                        placeholder="Saisir le montant..."
                        value={paymentAmount ?? ''}
                        onChange={handlePaymentAmountChange}
                        sx={{ mt: 3 }}
                        error={!!paymentAmountError}
                        helperText={paymentAmountError}
                        inputProps={{ min: 1, step: 1 }}
                        disabled={false}
                      />
                    </Box>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handlePaymentClose} color="secondary">Annuler</Button>
                  <Button onClick={handlePaymentSubmit} color="primary" variant="contained" disabled={paymentLoading || !!paymentAmountError}>
                    {paymentLoading ? <CircularProgress size={24} /> : 'Confirmer le Paiement'}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Modale de Finalisation */}
              {finalizeModalOpen && reinscriptionStudent && reinscriptionStudent.registration_mode !== 'online' && (
                <Dialog open={finalizeModalOpen} onClose={handleFinalizeClose} maxWidth="sm" fullWidth>
                  <DialogTitle>Finaliser l'Inscription</DialogTitle>
                  <DialogContent>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6">{`${reinscriptionStudent.first_name} ${reinscriptionStudent.last_name}`}</Typography>
                      <Typography color="text.secondary" gutterBottom>Matricule: {reinscriptionStudent.registration_number}</Typography>
                      
                      <FormControl fullWidth sx={{ mt: 3 }}>
                        <InputLabel>Assigner une classe</InputLabel>
                        <Select
                          value={finalizeClassId}
                          label="Assigner une classe"
                          onChange={(e) => setFinalizeClassId(e.target.value)}
                        >
                          {classes.map((c) => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <TextField
                        label="Montant du premier versement"
                        type="number"
                        fullWidth
                        placeholder="Ex: 50000"
                        value={finalizePayment}
                        onChange={(e) => setFinalizePayment(e.target.value)}
                        inputProps={{
                          min: 0,
                          step: 1000
                        }}
                        sx={{ mt: 3 }}
                      />
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleFinalizeClose} color="secondary">Annuler</Button>
                    <Button onClick={handleFinalizeSubmit} color="primary" variant="contained" disabled={finalizeLoading}>
                      {finalizeLoading ? <CircularProgress size={24} /> : 'Confirmer'}
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

              {/* Formulaire complet d'inscription pour les étudiants en ligne */}
              {showFinalizeForm && studentToFinalize && (
                <Dialog 
                  open={showFinalizeForm} 
                  onClose={() => setShowFinalizeForm(false)} 
                  maxWidth="md" 
                  fullWidth
                  PaperProps={{
                    sx: {
                      maxHeight: '90vh',
                      overflow: 'auto'
                    }
                  }}
                >
                  <DialogTitle>
                    Finaliser l'inscription - {studentToFinalize.first_name} {studentToFinalize.last_name}
                  </DialogTitle>
                  <DialogContent>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>Informations de l'étudiant</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Matricule"
                            value={studentToFinalize.registration_number || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nom"
                            value={studentToFinalize.last_name || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Prénom"
                            value={studentToFinalize.first_name || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Date de naissance"
                            value={studentToFinalize.date_of_birth || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Genre"
                            value={studentToFinalize.gender || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Ville"
                            value={studentToFinalize.city || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Adresse"
                            value={studentToFinalize.address || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                      </Grid>

                      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Informations du parent</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Prénom du parent"
                            value={studentToFinalize.parent_first_name || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nom du parent"
                            value={studentToFinalize.parent_last_name || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Téléphone du parent"
                            value={studentToFinalize.parent_phone || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Email du parent"
                            value={studentToFinalize.parent_email || ''}
                            fullWidth
                            disabled
                          />
                        </Grid>
                      </Grid>

                      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Finalisation de l'inscription</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Debug - Valeur actuelle du montant: {finalizePayment || 'vide'}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Classe à assigner</InputLabel>
                            <Select
                              value={finalizeClassId}
                              label="Classe à assigner"
                              onChange={(e) => setFinalizeClassId(e.target.value)}
                            >
                              {classes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Montant du premier versement"
                            type="number"
                            value={finalizePayment}
                            onChange={(e) => {
                              console.log('Saisie montant:', e.target.value);
                              setFinalizePayment(e.target.value);
                            }}
                            fullWidth
                            placeholder="Ex: 50000"
                            inputProps={{ min: 0, step: 1000 }}
                            disabled={finalizeLoading}
                            sx={{ 
                              '& .MuiInputBase-input': { 
                                backgroundColor: '#fff',
                                border: '2px solid #1976d2'
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                      {finalizeClassId && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Montant de la classe sélectionnée : 
                            <strong style={{ color: '#1976d2', marginLeft: '8px' }}>
                              {classes.find(c => c.id === parseInt(finalizeClassId))?.amount?.toLocaleString('fr-FR') || 'Non défini'} F CFA
                            </strong>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setShowFinalizeForm(false)}>Annuler</Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFinalizeSubmit}
                      disabled={!finalizeClassId || !finalizePayment || finalizeLoading}
                    >
                      {finalizeLoading ? <CircularProgress size={24} /> : 'Finaliser l\'inscription'}
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

              {/* Modale de reçu de paiement */}
              <Dialog open={showPaymentReceipt} onClose={() => setShowPaymentReceipt(false)} maxWidth="md" fullWidth>
                <DialogTitle>Reçu de Paiement</DialogTitle>
                <DialogContent>
                    {paymentReceiptData && (
                      <Box ref={paymentReceiptRef} sx={{ p: 4, border: '1px solid #ddd', borderRadius: '8px', bgcolor: '#fff' }}>
                        <Box sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: '2px solid #1976d2' }}>
                          <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            École "Le Savoir"
                          </Typography>
                        </Box>
                        
                        <Typography variant="h5" align="center" sx={{ my: 2, fontWeight: 'bold' }}>
                          REÇU DE PAIEMENT DE SCOLARITÉ
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                          <Typography><b>Date:</b> {new Date(paymentReceiptData.date).toLocaleString('fr-FR')}</Typography>
                          <Typography><b>Matricule:</b> {paymentReceiptData.registration_number}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }}><Chip label="Informations de l'Élève" /></Divider>
                        <Grid container spacing={1}>
                          <Grid item xs={12}><Typography><b>Élève:</b> {paymentReceiptData.first_name} {paymentReceiptData.last_name}</Typography></Grid>
                          <Grid item xs={12}><Typography><b>Classe:</b> {paymentReceiptData.classe}</Typography></Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 2, mt: 3 }}><Chip label="Détails du Paiement" /></Divider>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>Montant total de la scolarité</TableCell>
                              <TableCell align="right">{Number(paymentReceiptData.montant_total_scolarite || 0).toLocaleString('fr-FR')} F CFA</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Total des réductions</TableCell>
                              <TableCell align="right">{Number(paymentReceiptData.total_reductions || 0).toLocaleString('fr-FR')} F CFA</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Montant dû avant ce paiement</TableCell>
                              <TableCell align="right"><b>{Number(paymentReceiptData.montant_du_avant || 0).toLocaleString('fr-FR')} F CFA</b></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Montant de ce versement</TableCell>
                              <TableCell align="right"><b>{Number(paymentReceiptData.montant_verse || 0).toLocaleString('fr-FR')} F CFA</b></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Total déjà versé (ce paiement inclus)</TableCell>
                              <TableCell align="right">{Number(paymentReceiptData.total_deja_verse || 0).toLocaleString('fr-FR')} F CFA</TableCell>
                            </TableRow>
                             <TableRow sx={{ '& td, & th': { border: 0 }, background: (theme) => (paymentReceiptData.reste_a_payer > 0 ? 'rgba(255, 0, 0, 0.05)' : 'rgba(0, 255, 0, 0.05)')}}>
                              <TableCell sx={{ fontWeight: 'bold' }}>Reste à payer</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {Number(paymentReceiptData.reste_a_payer || 0).toLocaleString('fr-FR')} F CFA
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

                        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <Typography variant="caption" color="text.secondary">
                             Statut: {paymentReceiptData.reste_a_payer > 0 ? <Chip label="Non soldé" color="error" size="small"/> : <Chip label="Soldé" color="success" size="small"/>}
                          </Typography>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography>Le secrétariat</Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button onClick={() => setShowPaymentReceipt(false)}>Fermer</Button>
                  <Button color="primary" variant="contained" startIcon={<PrintIcon />} onClick={handlePrintPaymentReceipt}>Imprimer</Button>
                </DialogActions>
              </Dialog>

              {/* Modale de réinscription */}
              <Dialog open={reinscriptionOpen} onClose={handleReinscriptionClose} maxWidth="sm" fullWidth>
                <DialogTitle>Réinscription d'un élève</DialogTitle>
                <DialogContent>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Matricule de l'élève"
                      value={matriculeSearch}
                      onChange={e => setMatriculeSearch(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      onKeyDown={e => { if (e.key === 'Enter') handleMatriculeSearch(); }}
                      disabled={reinscriptionLoading}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleMatriculeSearch}
                      disabled={reinscriptionLoading || !matriculeSearch}
                      sx={{ mb: 2 }}
                    >
                      {reinscriptionLoading ? <CircularProgress size={22} /> : 'Rechercher'}
                    </Button>
                    {reinscriptionError && (
                      <Typography color="error" sx={{ mt: 1 }}>{reinscriptionError}</Typography>
                    )}
                    {reinscriptionStudent && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" mb={2}>Informations de l'élève</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}><TextField label="Nom" value={reinscriptionStudent.last_name} fullWidth disabled /></Grid>
                          <Grid item xs={12} sm={6}><TextField label="Prénom" value={reinscriptionStudent.first_name} fullWidth disabled /></Grid>
                          <Grid item xs={12} sm={6}><TextField label="Date de naissance" value={reinscriptionStudent.date_of_birth} fullWidth disabled /></Grid>
                          <Grid item xs={12} sm={6}><TextField label="Classe actuelle" value={reinscriptionStudent.classe} fullWidth disabled /></Grid>
                          <Grid item xs={12} sm={6}><TextField label="Matricule" value={reinscriptionStudent.registration_number} fullWidth disabled /></Grid>
                          <Grid item xs={12} sm={6}><TextField label="Ville" value={reinscriptionStudent.city} fullWidth disabled /></Grid>
                        </Grid>
                        {/* Affichage du niveau suivant */}
                        {targetLevel && (
                          <Box sx={{ mt: 3 }}>
                            <TextField label="Niveau pour la nouvelle année" value={targetLevel} fullWidth disabled />
                            {annualAverage && (
                              <Typography variant="caption" color={annualAverage.isAdmis ? 'success.main' : 'error.main'}>
                                {annualAverage.isAdmis ? 'Admis en classe supérieure' : 'Non admis, redoublement'}
                              </Typography>
                            )}
                          </Box>
                        )}
                        {previousYearDue > 0 && (
                          <Box sx={{ mt: 3, mb: 2 }}>
                            <Typography color="error" sx={{ fontWeight: 'bold' }}>
                              Reliquat à payer pour l'année {getPreviousSchoolYear()} : {previousYearDue.toLocaleString('fr-FR')} F CFA
                            </Typography>
                            <TextField
                              label="Montant à régler pour l'année précédente"
                              type="number"
                              fullWidth
                              value={previousYearPayment}
                              onChange={e => setPreviousYearPayment(e.target.value)}
                              inputProps={{ min: 0, max: previousYearDue, step: 1000 }}
                              sx={{ mt: 1 }}
                              required
                            />
                            {/* Statut soldé/non soldé année précédente */}
                            <Box sx={{ mt: 1, mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                Statut année {getPreviousSchoolYear()} :
                              </Typography>
                              <Chip
                                label={previousYearDue > 0 ? 'Non soldé' : 'Soldé'}
                                color={previousYearDue > 0 ? 'error' : 'success'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              L'élève doit s'acquitter de ce reliquat avant de pouvoir être réinscrit.
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="h6" mt={4} mb={2}>Informations du parent</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}><TextField label="Prénom du parent" name="parent_first_name" value={parentFields.parent_first_name} onChange={handleParentFieldChange} fullWidth /></Grid>
                          <Grid item xs={12} sm={6}><TextField label="Nom du parent" name="parent_last_name" value={parentFields.parent_last_name} onChange={handleParentFieldChange} fullWidth /></Grid>
                          <Grid item xs={12} sm={6}><TextField label="Téléphone du parent" name="parent_phone" value={parentFields.parent_phone} onChange={handleParentFieldChange} fullWidth /></Grid>
                          <Grid item xs={12} sm={6}><TextField label="Email du parent" name="parent_email" value={parentFields.parent_email} onChange={handleParentFieldChange} fullWidth /></Grid>
                          <Grid item xs={12}><TextField label="Contact du parent" name="parent_contact" value={parentFields.parent_contact} onChange={handleParentFieldChange} fullWidth /></Grid>
                        </Grid>
                        {/* Affichage de la classe précédente et statut admission/doublant */}
                        <Box sx={{ mt: 3 }}>
                          <TextField
                            label="Classe précédente"
                            value={previousClass}
                            fullWidth
                            disabled
                          />
                          {annualAverage && (
                            <Typography variant="caption" color={annualAverage.isAdmis ? 'success.main' : 'error.main'}>
                              {annualAverage.isAdmis
                                ? 'Admis en classe supérieure (choisissez une classe du niveau supérieur)'
                                : 'Non admis, redoublement (choisissez une classe du même niveau)'}
                            </Typography>
                          )}
                        </Box>
                        <FormControl fullWidth sx={{ mt: 3 }}>
                          <InputLabel>Nouvelle classe</InputLabel>
                          <Select
                            value={reinscriptionClassId}
                            label="Nouvelle classe"
                            onChange={e => setReinscriptionClassId(e.target.value)}
                          >
                            {classesNiveauCible.map((c) => (
                              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Montant du premier versement"
                          type="number"
                          fullWidth
                          placeholder="Ex: 50000"
                          value={reinscriptionPayment}
                          onChange={e => setReinscriptionPayment(e.target.value)}
                          inputProps={{ min: 0, step: 1000 }}
                          sx={{ mt: 3 }}
                        />
                        {/* Affichage du message d'erreur juste en dessous du formulaire */}
                        {reinscriptionApiError && (
                          <Box sx={{ my: 2 }}>
                            <Typography color="error" sx={{ fontWeight: 'bold' }}>
                              {reinscriptionApiError}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleReinscriptionClose} color="secondary">Annuler</Button>
                  <Button
                    onClick={handleReinscriptionSubmit}
                    color="primary"
                    variant="contained"
                    disabled={
                      !reinscriptionStudent || !reinscriptionClassId || !reinscriptionPayment || reinscriptionSubmitting ||
                      (previousYearDue > 0 && (!previousYearPayment || Number(previousYearPayment) < previousYearDue))
                    }
                  >
                    {reinscriptionSubmitting ? <CircularProgress size={22} /> : 'Valider la réinscription'}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Modale de reçu de finalisation */}
              <Dialog open={showReceipt} onClose={() => {
                setShowReceipt(false);
                handleFinalizeClose(); // Fermer aussi la modale de finalisation
              }} maxWidth="md" fullWidth>
                <DialogTitle>Reçu de Finalisation</DialogTitle>
                <DialogContent>
                  {console.log('showReceipt:', showReceipt, 'receiptData:', receiptData)}
                  {receiptData && (
                    <Box ref={receiptRef} sx={{ p: 4, border: '1px solid #1976d2', borderRadius: '16px', bgcolor: '#fafdff', boxShadow: 4, maxWidth: 700, mx: 'auto', my: 2 }}>
                      <Box sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: '3px solid #1976d2', position: 'relative' }}>
                        <Typography variant="h3" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold', letterSpacing: 1, mb: 1, fontFamily: 'Montserrat, Arial' }}>
                          École "Le Savoir"
                        </Typography>
                      </Box>
                      <Typography variant="h4" align="center" sx={{ my: 2, fontWeight: 'bold', color: '#222', letterSpacing: 1 }}>
                        REÇU DE FINALISATION D'INSCRIPTION
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography sx={{ fontWeight: 500, color: '#555' }}><b>Date:</b> {receiptData.date}</Typography>
                        <Typography sx={{ fontWeight: 500, color: '#555' }}><b>Matricule:</b> {receiptData.registration_number}</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }}><Chip label="Informations de l'Élève" sx={{ fontWeight: 700, fontSize: 16, bgcolor: '#e3f2fd', color: '#1976d2' }} /></Divider>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}><Typography><b>Nom:</b> {receiptData.last_name}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Prénom:</b> {receiptData.first_name}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Date de naissance:</b> {receiptData.date_of_birth}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Classe:</b> {receiptData.classe}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Code élève:</b> {receiptData.student_code}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Code parent:</b> {receiptData.parent_code}</Typography></Grid>
                      </Grid>
                      <Divider sx={{ my: 2, mt: 3 }}><Chip label="Informations du Parent" sx={{ fontWeight: 700, fontSize: 16, bgcolor: '#e3f2fd', color: '#1976d2' }} /></Divider>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}><Typography><b>Nom du parent:</b> {receiptData.parent_last_name}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Prénom du parent:</b> {receiptData.parent_first_name}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Téléphone:</b> {receiptData.parent_phone}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Email:</b> {receiptData.parent_email}</Typography></Grid>
                        <Grid item xs={12}><Typography><b>Contact:</b> {receiptData.parent_contact}</Typography></Grid>
                      </Grid>
                      <Divider sx={{ my: 2, mt: 3 }}><Chip label="Détails du Paiement" sx={{ fontWeight: 700, fontSize: 16, bgcolor: '#e3f2fd', color: '#1976d2' }} /></Divider>
                      <Table size="medium" sx={{ mb: 2 }}>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Montant total de la scolarité</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2', fontSize: 18 }}>
                              {Number(receiptData.class_amount).toLocaleString('fr-FR')} F CFA
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Total des réductions (bourses, bons, prises en charge...)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#388e3c', fontSize: 18 }}>
                              {Number(receiptData.total_discount).toLocaleString('fr-FR')} F CFA
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Montant du premier versement</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#388e3c', fontSize: 18 }}>
                              {Number(receiptData.payment_amount).toLocaleString('fr-FR')} F CFA
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Total déjà versé</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#388e3c', fontSize: 18 }}>
                              {Number(receiptData.total_paid).toLocaleString('fr-FR')} F CFA
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Reste à payer</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#d32f2f', fontSize: 18 }}>
                              {Number(receiptData.reste_a_payer) <= 0 ? 'Soldé' : `${Number(receiptData.reste_a_payer).toLocaleString('fr-FR')} F CFA`}
                            </TableCell>
                          </TableRow>
                          {/* Détail des réductions */}
                          {receiptData.reductions && receiptData.reductions.length > 0 && (
                            <>
                              <TableRow>
                                <TableCell colSpan={2} sx={{ fontWeight: 700, color: '#1976d2', fontSize: 16, background: '#e3f2fd' }}>
                                  Détail des réductions
                                </TableCell>
                              </TableRow>
                              {receiptData.reductions.map((r: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell>
                                    {r.name}
                                    {r.is_percentage ? ` (${r.percentage}%)` : ''}
                                  </TableCell>
                                  <TableCell align="right">
                                    -{Number(r.montant_applique).toLocaleString('fr-FR')} F CFA
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          )}
                        </TableBody>
                      </Table>
                      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: 16 }}>
                          Statut: <Chip label="Inscription finalisée" color="success" size="medium" sx={{ fontWeight: 700, fontSize: 16 }} />
                        </Typography>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontStyle: 'italic', color: '#1976d2', fontWeight: 600 }}>Le secrétariat</Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  {!receiptData && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="error">Aucune donnée de reçu disponible</Typography>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button onClick={() => {
                    setShowReceipt(false);
                    handleFinalizeClose(); // Fermer aussi la modale de finalisation
                  }}>Fermer</Button>
                  <Button color="primary" variant="contained" startIcon={<PrintIcon />} onClick={handlePrintReceipt}>Imprimer</Button>
                </DialogActions>
              </Dialog>

              {/* Modale de reçu de réinscription */}
              <Dialog open={showReinscriptionReceipt} onClose={() => setShowReinscriptionReceipt(false)} maxWidth="md" fullWidth>
                <DialogTitle>Reçu de Réinscription</DialogTitle>
                <DialogContent>
                  {reinscriptionReceiptData && (
                    <Box ref={reinscriptionReceiptRef} sx={{ p: 4, border: '1px solid #1976d2', borderRadius: '16px', bgcolor: '#fafdff', boxShadow: 4, maxWidth: 700, mx: 'auto', my: 2 }}>
                      <Box sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: '3px solid #1976d2', position: 'relative' }}>
                        {/* Logo ou icône d'école (optionnel) */}
                        {/* <SchoolIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} /> */}
                        <Typography variant="h3" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold', letterSpacing: 1, mb: 1, fontFamily: 'Montserrat, Arial' }}>
                          École "Le Savoir"
                        </Typography>
                      </Box>
                      <Typography variant="h4" align="center" sx={{ my: 2, fontWeight: 'bold', color: '#222', letterSpacing: 1 }}>
                        REÇU DE RÉINSCRIPTION
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography sx={{ fontWeight: 500, color: '#555' }}><b>Date:</b> {reinscriptionReceiptData.date}</Typography>
                        <Typography sx={{ fontWeight: 500, color: '#555' }}><b>Matricule:</b> {reinscriptionReceiptData.registration_number}</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }}><Chip label="Informations de l'Élève" sx={{ fontWeight: 700, fontSize: 16, bgcolor: '#e3f2fd', color: '#1976d2' }} /></Divider>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}><Typography><b>Nom:</b> {reinscriptionReceiptData.last_name}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Prénom:</b> {reinscriptionReceiptData.first_name}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Date de naissance:</b> {reinscriptionReceiptData.date_of_birth}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Classe:</b> {reinscriptionReceiptData.classe}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Année scolaire:</b> {reinscriptionReceiptData.schoolYear}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Code élève:</b> {reinscriptionReceiptData.student_code}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Code parent:</b> {reinscriptionReceiptData.parent_code}</Typography></Grid>
                      </Grid>
                      <Divider sx={{ my: 2, mt: 3 }}><Chip label="Informations du Parent" sx={{ fontWeight: 700, fontSize: 16, bgcolor: '#e3f2fd', color: '#1976d2' }} /></Divider>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}><Typography><b>Nom du parent:</b> {reinscriptionReceiptData.parent.parent_last_name}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Prénom du parent:</b> {reinscriptionReceiptData.parent.parent_first_name}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Téléphone:</b> {reinscriptionReceiptData.parent.parent_phone}</Typography></Grid>
                        <Grid item xs={12} sm={6}><Typography><b>Email:</b> {reinscriptionReceiptData.parent.parent_email}</Typography></Grid>
                        <Grid item xs={12}><Typography><b>Contact:</b> {reinscriptionReceiptData.parent.parent_contact}</Typography></Grid>
                      </Grid>
                      <Divider sx={{ my: 2, mt: 3 }}><Chip label="Détails du Paiement" sx={{ fontWeight: 700, fontSize: 16, bgcolor: '#e3f2fd', color: '#1976d2' }} /></Divider>
                      <Table size="medium" sx={{ mb: 2 }}>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Montant du premier versement</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#388e3c', fontSize: 18 }}>{Number(reinscriptionReceiptData.payment_amount).toLocaleString('fr-FR')} F CFA</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Reliquat année précédente</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#d32f2f', fontSize: 18 }}>{Number(previousYearDue).toLocaleString('fr-FR')} F CFA</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: 16 }}>
                          Statut: <Chip label="Réinscrit" color="success" size="medium" sx={{ fontWeight: 700, fontSize: 16 }} />
                        </Typography>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontStyle: 'italic', color: '#1976d2', fontWeight: 600 }}>Le secrétariat</Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button onClick={() => setShowReinscriptionReceipt(false)}>Fermer</Button>
                  <Button color="primary" variant="contained" startIcon={<PrintIcon />} onClick={handlePrintReinscriptionReceipt}>Imprimer</Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Students; 