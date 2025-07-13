import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * Test component to simulate DOM manipulation errors
 * This component tests rapid navigation and async operations
 */
const DOMErrorTest = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Test 1: Simulate async operation with rapid navigation
  useEffect(() => {
    let isMounted = true;
    
    const simulateAsyncOperation = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!isMounted) return;
        setData({ message: 'Test data loaded successfully' });
      } catch (err) {
        if (isMounted) setError('Test error occurred');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    simulateAsyncOperation();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Test 2: Simulate rapid state updates
  const handleRapidNavigation = () => {
    // Simulate rapid navigation that could cause DOM errors
    setTimeout(() => navigate('/student-dashboard'), 100);
    setTimeout(() => navigate('/student-payment'), 200);
    setTimeout(() => navigate('/student-schedule'), 300);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Test de Correction d'Erreur DOM
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Ce composant teste les corrections apportées pour résoudre l'erreur "Failed to execute 'removeChild' on 'Node'"
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 1: Opération asynchrone avec nettoyage
        </Typography>
        {loading && <CircularProgress size={20} sx={{ mr: 2 }} />}
        {data && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {data.message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 2: Navigation rapide
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleRapidNavigation}
          sx={{ mr: 2 }}
        >
          Tester Navigation Rapide
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/student-dashboard')}
        >
          Aller au Dashboard
        </Button>
      </Box>

      <Alert severity="success" sx={{ mt: 3 }}>
        ✅ Si vous ne voyez pas d'erreur dans la console, les corrections fonctionnent correctement !
      </Alert>
    </Box>
  );
};

export default DOMErrorTest; 