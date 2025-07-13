import React, { useState, useEffect } from 'react';
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
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  Euro as EuroIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import SecretarySidebar from '../../components/SecretarySidebar';

// Fonction utilitaire pour générer les années scolaires
function getSchoolYears(count = 5) {
  const now = new Date();
  const currentYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: count }, (_, i) => {
    const start = currentYear - (count - 1 - i);
    return `${start}-${start + 1}`;
  }).reverse();
}

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [availableYears, setAvailableYears] = useState<string[]>(getSchoolYears(5));

  // Modifie le fetch des paiements pour inclure l'année scolaire
  useEffect(() => {
    fetch(`/api/payments?school_year=${schoolYear}`)
      .then(res => res.json())
      .then(data => setPayments(data));
  }, [schoolYear]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcul des statistiques
  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.statut === 'Payé').length;
  const pendingPayments = payments.filter(p => p.statut === 'En attente').length;
  const latePayments = payments.filter(p => p.statut === 'Retard').length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SecretarySidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Gestion des Paiements
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Nouveau Paiement
          </Button>
        </Box>

        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{totalPayments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Paiements
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{paidPayments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paiements Effectués
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EuroIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{pendingPayments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Attente
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{latePayments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Retard
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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

        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un paiement..."
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

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Matricule</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prénom</TableCell>
                  <TableCell>Montant</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.matricule}</TableCell>
                      <TableCell>{payment.nom}</TableCell>
                      <TableCell>{payment.prenom}</TableCell>
                      <TableCell>{payment.montant} €</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.statut}
                          color={
                            payment.statut === 'Payé'
                              ? 'success'
                              : payment.statut === 'En attente'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" size="small">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton color="primary" size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPayments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default Payments; 