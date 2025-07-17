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
      <Fade in={true} timeout={1000}>
        <Paper elevation={3} sx={{ p: 8, mb: 6, borderRadius: 0, background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`, color: 'white', textAlign: 'center' }}>
          <Container maxWidth="md">
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, letterSpacing: 1 }}>
              Collège Excellence
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, opacity: 0.9 }}>
              Bienvenue au Collège Excellence
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Un établissement d'exception pour votre réussite
            </Typography>
          </Container>
        </Paper>
      </Fade>

      <Container maxWidth="lg">
        {/* Pourquoi nous choisir ? */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Pourquoi nous choisir ?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 3, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: feature.color, mb: 2, mx: 'auto' }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mission & Vision */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Zoom in={true}>
                <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${blue[500]} 0%, ${blue[700]} 100%)`, color: 'white', position: 'relative' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Notre Mission
                  </Typography>
                  <Typography sx={{ mb: 3 }}>
                    Former les leaders de demain en offrant une éducation d'excellence et en développant le potentiel de chaque élève.
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    component={RouterLink}
                    to="/secretary-login"
                    sx={{
                      opacity: 0,
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      pointerEvents: 'auto',
                      zIndex: 1,
                    }}
                    startIcon={<LoginIcon />}
                    tabIndex={0}
                    aria-label="Connexion Secrétaire (invisible)"
                  >
                    Connexion Secrétaire
                  </Button>
                </Paper>
              </Zoom>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in={true}>
                <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${green[500]} 0%, ${green[700]} 100%)`, color: 'white' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Notre Vision
                  </Typography>
                  <Typography>
                    Être reconnu comme un établissement d'excellence qui prépare les élèves à réussir dans un monde en constante évolution.
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>

        {/* Valeurs */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Nos valeurs
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={value.title}>
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 3, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: value.color, mb: 2, mx: 'auto' }}>
                        {value.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {value.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Dernières actualités */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Dernières actualités
          </Typography>
          <Grid container spacing={4}>
            {news.map((item, index) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 3, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {item.icon}
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, ml: 1 }}>
                          {item.title}
                        </Typography>
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        {item.date}
                      </Typography>
                      <Typography>
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to action */}
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

        {/* Footer */}
        <Box sx={{ mb: 0 }}>
          <Paper elevation={3} sx={{ p: 6, borderRadius: 0, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, color: 'white', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
            <Container maxWidth="lg">
              <Grid container spacing={6}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    À propos
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Le Collège Excellence est un établissement d'enseignement secondaire reconnu pour son excellence académique et son engagement envers le développement des élèves.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <IconButton sx={{ color: 'white' }}><FacebookIcon /></IconButton>
                    <IconButton sx={{ color: 'white' }}><TwitterIcon /></IconButton>
                    <IconButton sx={{ color: 'white' }}><InstagramIcon /></IconButton>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Contact
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 2 }} />
                    <Typography>123 Avenue de l'Éducation, 75000 Paris</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 2 }} />
                    <Typography>01 23 45 67 89</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 2 }} />
                    <Typography>contact@college-excellence.fr</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Liens rapides
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>À propos de nous</Typography>
                    <Typography sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Admission</Typography>
                    <Typography sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Programmes</Typography>
                    <Typography sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Événements</Typography>
                    <Typography sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Contact</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                <Typography variant="body2">
                  © 2025 Collège Excellence. Tous droits réservés.
                </Typography>
              </Box>
            </Container>
          </Paper>
        </Box>
      </Container>

      {/* Modale d'inscription ou affichage direct selon l'écran */}
      {isMobile ? (
        <Box sx={{ maxWidth: 700, mx: 'auto', my: 4 }}>
          <RegistrationMinimal />
        </Box>
      ) : (
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
      )}
    </Box>
  );
};

export default Home; 