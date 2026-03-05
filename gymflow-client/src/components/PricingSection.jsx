import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  List,
  SimpleGrid,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../api/apiService';

const PricingSection = () => {
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, setRedirectPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionTypes = async () => {
      try {
        setLoading(true);
        const types = await apiService.get('/subscriptions/types');

        const activeTypes = types
          .filter((type) => type.is_active)
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
      navigate(`/trainee/subscriptions/confirm/${packageId}`);
    } else {
      setRedirectPath('/trainee/subscriptions/pricing');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={12}>
        <Spinner size="xl" color="brand.400" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Text textAlign="center" py={8} color="red.400">
        {error}
      </Text>
    );
  }

  return (
    <Box py={20} bg="dark.section" id="pricing">
      <Container maxW="container.xl">
        <Heading textAlign="center" mb={4} color="brand.500" textTransform="uppercase">
          תוכניות מחיר
        </Heading>
        <Text textAlign="center" color="gray.400" mb={12}>
          בחר את החבילה המתאימה לך
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
          {subscriptionTypes.map((subType) => (
            <Box
              key={subType.id}
              bg="dark.card"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="dark.border"
              p={8}
              textAlign="right"
              dir="rtl"
              boxShadow="xl"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-6px)', borderColor: 'brand.400' }}
            >
              <Heading size="lg" mb={6} color="brand.500">
                {subType.name}
              </Heading>

              <Text fontSize="4xl" color="brand.400" fontWeight="bold" mb={6}>
                ₪{parseFloat(subType.price).toFixed(0)}
                <Text as="span" fontSize="md" color="gray.400" fontWeight="normal">
                  {' '}/ {subType.duration_days} ימים
                </Text>
              </Text>

              <List.Root gap={3} mb={8}>
                {(subType.description || '')
                  .split('\n')
                  .filter(Boolean)
                  .map((feature, idx) => (
                    <List.Item key={idx} display="flex" alignItems="center" color="gray.300">
                      <Text as="span" color="brand.400" me={2}>
                        ✓
                      </Text>
                      <Text>{feature}</Text>
                    </List.Item>
                  ))}
              </List.Root>

              <Button
                w="full"
                colorPalette="brand"
                size="lg"
                onClick={() => handleSelectPackage(subType.id)}
              >
                הצטרף עכשיו
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default PricingSection;
