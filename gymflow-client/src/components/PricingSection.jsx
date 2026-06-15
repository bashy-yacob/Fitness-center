// בקובץ: src/components/PricingSection.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// === 1. שינוי הייבוא: משתמשים ב-apiService הגנרי ===
import apiService from '../api/apiService';
import { Box, Heading, Text, SimpleGrid, Button, List, Flex } from '@chakra-ui/react';

const PricingSection = () => {
  // === 2. שינוי שם המשתנה לבהירות ===
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, setRedirectPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionTypes = async () => {
      try {
        setLoading(true);
        // === 3. שינוי קריאת ה-API לנתיב הנכון ===
        const types = await apiService.get('/subscriptions/types');

        const activeTypes = types
          .filter(type => type.is_active)
          .sort((a, b) => a.price - b.price);

        setSubscriptionTypes(activeTypes);
      } catch (err) {
        setError('Failed to load subscription plans.');
        console.error('Error fetching subscription types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionTypes();
  }, []);

  const handleSelectPackage = (packageId) => {
    if (isAuthenticated) {
      // אם מחובר, שלח לעמוד האישור (שניצור בהמשך)
      navigate(`/trainee/subscriptions/confirm/${packageId}`);
    } else {
      // אם לא מחובר, שמור את היעד והפנה ללוגין
      setRedirectPath('/trainee/subscriptions/pricing');
      navigate('/login');
    }
  };

  if (loading) {
    return <Box textAlign="center" p={8} fontSize="1.2rem" color="gray.400">טוען חבילות...</Box>;
  }

  if (error) {
    return <Box textAlign="center" p={8} fontSize="1.2rem" color="red.400">{error}</Box>;
  }

  return (
    <Box as="section" id="pricing" py="80px" px="20px" bg="dark.section" textAlign="center">
      <Heading
        as="h2"
        fontSize="2.5rem"
        color="brand.500"
        mb={4}
        fontWeight="900"
        letterSpacing="1px"
        textTransform="uppercase"
        textShadow="0 2px 8px rgba(34, 219, 71, 0.15)"
      >
        תוכניות מחיר
      </Heading>
      <Text fontSize="1.2rem" color="gray.400" mb="3rem">בחר את החבילה המתאימה לך</Text>
      <SimpleGrid minChildWidth="300px" gap="2rem" maxW="1200px" mx="auto" p="20px">
        {subscriptionTypes.map((subType) => (
          <Box
            key={subType.id}
            bg="dark.card"
            borderRadius="18px"
            p="2rem"
            boxShadow="0 4px 16px rgba(0, 0, 0, 0.12)"
            border="1.5px solid"
            borderColor="dark.border"
            position="relative"
            overflow="hidden"
            textAlign="right"
            dir="rtl"
            color="white"
            transition="transform 0.3s, box-shadow 0.2s, border 0.2s"
            _hover={{
              transform: 'translateY(-10px) scale(1.03)',
              boxShadow: '0 8px 32px 0 rgba(34, 219, 71, 0.1)',
              borderColor: 'brand.400',
            }}
          >
            <Heading as="h3" fontSize="1.8rem" color="brand.500" fontWeight="900" mb="1.5rem">
              {subType.name}
            </Heading>
            <Box fontSize="2.5rem" color="brand.400" mb="2rem" fontWeight="900">
              <Box as="span" fontSize="1.5rem" verticalAlign="super">₪</Box>
              <Box as="span">{parseFloat(subType.price).toFixed(0)}</Box>
              {/* === התאמת שם השדה ל-duration_days === */}
              <Box as="span" fontSize="1rem" color="gray.400">/ {subType.duration_days} ימים</Box>
            </Box>
            <List.Root listStyle="none" m="0 0 2rem 0" p={0}>
              {/* ודא שהאובייקט כולל תיאור */}
              {(subType.description || '').split('\n').map((feature, idx) => (
                <List.Item key={idx} color="gray.400" mb="1rem">
                  <Flex align="center" gap="0.5rem">
                    <Box as="span" color="brand.400" fontWeight="bold">✓</Box>
                    {feature}
                  </Flex>
                </List.Item>
              ))}
            </List.Root>
            <Button
              onClick={() => handleSelectPackage(subType.id)}
              w="100%"
              bg="brand.400"
              color="#111"
              borderRadius="25px"
              py="1rem"
              fontSize="1.1rem"
              fontWeight="700"
              letterSpacing="1px"
              _hover={{ bg: 'brand.600', color: '#fff' }}
            >
              הצטרף עכשיו
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default PricingSection;
