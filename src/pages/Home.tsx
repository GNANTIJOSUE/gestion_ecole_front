import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  Paper,
  Avatar,
  Fade,
  Zoom,
  IconButton,
  Divider,
  useMediaQuery,
  Modal,
} from '@mui/material';
import {
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  Group as GroupIcon,
  Event as EventIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Star as StarIcon,
  Computer as ComputerIcon,
  SportsSoccer as SportsSoccerIcon,
  Lightbulb as LightbulbIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { blue, green, orange, purple, pink } from '@mui/material/colors';
import Registration from './Registration';
import ErrorBoundary from '../components/ErrorBoundary';
import { Link as RouterLink } from 'react-router-dom';
import { RegistrationMinimal } from './Registration';

const Home = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State pour afficher/cacher le formulaire d'inscription
  const [showRegistration, setShowRegistration] = React.useState(false);

  // Pourquoi nous choisir ?
  const features = [
    {
      title: 'Excellence académique',
      description: 'Taux de réussite de 98% au brevet des collèges',
      icon: <StarIcon />,
      color: blue[500],
    },
    {
      title: 'Enseignants qualifiés',
      description: 'Une équipe pédagogique expérimentée et dévouée',
      icon: <GroupIcon />,
      color: green[500],
    },
    {
      title: 'Équipements modernes',
      description: 'Laboratoires et salles informatiques à la pointe',
      icon: <ComputerIcon />,
      color: orange[500],
    },
    {
      title: 'Activités extrascolaires',
      description: 'Sports, arts, clubs et associations variés',
      icon: <SportsSoccerIcon />,
      color: purple[500],
    },
  ];

  // Valeurs
  const values = [
    {
      title: 'Innovation constante',
      icon: <LightbulbIcon />,
      color: pink[500],
    },
    {
      title: 'Environnement d\'apprentissage optimal',
      icon: <SchoolIcon />,
      color: blue[500],
    },
    {
      title: 'Communauté bienveillante',
      icon: <PeopleIcon />,
      color: green[500],
    },
  ];

  // Actualités
  const news = [
    {
      title: 'Inscriptions 2024-2025',
      date: '15 Mars 2024',
      description: "Les inscriptions pour l'année scolaire 2024-2025 sont maintenant ouvertes.",
      icon: <CheckCircleIcon sx={{ color: green[500] }} />,
    },
    {
      title: 'Journée Portes Ouvertes',
      date: '20 Mars 2024',
      description: 'Venez découvrir notre établissement lors de notre journée portes ouvertes.',
      icon: <EventIcon sx={{ color: blue[500] }} />,
    },
    {
      title: 'Nouveau Laboratoire Informatique',
      date: '1 Avril 2024',
      description: 'Un nouveau laboratoire informatique sera inauguré au mois d\'avril.',
      icon: <ComputerIcon sx={{ color: orange[500] }} />,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)' }}>
      {/* Hero Section */}
      {/* ... tout le contenu existant ... */}
      <Container maxWidth="lg">
        {/* ... autres sections ... */}

        {/* Call to action & inscription */}
        {isMobile ? (
          <Box sx={{ maxWidth: 700, mx: 'auto', my: 4 }}>
            <RegistrationMinimal />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 8, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Rejoignez notre communauté
              </Typography>
              <Typography sx={{ mb: 3 }}>
                Découvrez l'excellence académique et le développement personnel au Collège Excellence.
              </Typography>
              <Button
                variant="contained"
                size="large"
                color="primary"
                onClick={() => setShowRegistration(true)}
              >
                S'inscrire
              </Button>
            </Box>
            <Modal
              open={showRegistration}
              onClose={() => setShowRegistration(false)}
              aria-labelledby="modal-inscription"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
              }}
            >
              <Box
                sx={{
                  width: { xs: '100vw', sm: 500, md: 700 },
                  maxWidth: { xs: '100vw', sm: '98vw' },
                  height: { xs: '100vh', sm: 'auto' },
                  maxHeight: { xs: '100vh', sm: '98vh' },
                  overflowY: 'auto',
                  borderRadius: { xs: 0, sm: 5 },
                  boxShadow: 24,
                  bgcolor: 'background.paper',
                  p: { xs: 1, sm: 3, md: 4 },
                  m: 0,
                  transition: 'all 0.3s',
                }}
              >
                <ErrorBoundary>
                  <Registration key={showRegistration ? 'open' : 'closed'} onClose={() => setShowRegistration(false)} />
                </ErrorBoundary>
              </Box>
            </Modal>
          </>
        )}

        {/* Footer */}
        <Box sx={{ mb: 0 }}>
          {/* ... footer existant ... */}
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 