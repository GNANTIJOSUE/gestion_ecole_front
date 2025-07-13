import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

/**
 * Test component to verify DOM manipulation error fixes
 * This component simulates rapid navigation and async operations
 */
const TestComponent = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test useEffect with proper cleanup
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!isMounted) return;
        
        // Simulate successful response
        setData({ message: 'Test data loaded successfully' });
      } catch (err) {
        if (isMounted) {
          setError('Test error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTestNavigation = () => {
    // Simulate rapid navigation
    window.location.href = '/student/dashboard';
  };

  const handleTestAsyncOperation = async () => {
    let isMounted = true;
    
    setLoading(true);
    
    try {
      // Simulate long async operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isMounted) {
        setData({ message: 'Async operation completed' });
      }
    } catch (err) {
      if (isMounted) {
        setError('Async operation failed');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Test Component - DOM Error Fix
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This component tests the DOM manipulation error fixes by simulating:
      </Typography>
      
      <ul style={{ marginBottom: 20 }}>
        <li>useEffect with proper cleanup</li>
        <li>Async operations with mounted state checks</li>
        <li>Rapid navigation scenarios</li>
      </ul>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleTestAsyncOperation}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Test Async Operation'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handleTestNavigation}
        >
          Test Navigation
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Loading...</Typography>
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      
      {data && (
        <Typography sx={{ mb: 2 }}>
          Data: {data.message}
        </Typography>
      )}
      
      <Typography variant="body2" color="text.secondary">
        Check the browser console for any DOM manipulation errors.
        If no errors appear, the fixes are working correctly.
      </Typography>
    </Box>
  );
};

export default TestComponent; 