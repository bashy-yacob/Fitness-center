import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Heading, Text, SimpleGrid, Button, Flex, Spinner, Alert, Card } from '@chakra-ui/react';

function PricingPage() {
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, setRedirectPath } = useAuth();

    useEffect(() => {
        const fetchSubscriptionTypes = async () => {
            setLoading(true);
            try {
                const types = await apiService.get('/subscriptions/types');
                setSubscriptionTypes(types.filter(type => type.is_active));
            } catch (err) {
                setError('Failed to load subscription plans.');
                console.error("Error fetching subscription types:", err);
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
            const targetPath = `/trainee/subscriptions/confirm/${packageId}`;
            setRedirectPath(targetPath);
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
                <Text ml={4} color="white">טוען חבילות מנויים...</Text>
            </Flex>
        );
    }

    if (error) {
        return (
            <Container mt={10}>
                <Alert.Root status="error">
                    <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
            </Container>
        );
    }

    return (
        <Box bg="dark.bg" minH="100vh" py={10}>
            <Container maxW="container.xl">
                <Heading mb={4} color="brand.500" textAlign="center">רכישת מנוי</Heading>
                <Text mb={8} color="gray.400" textAlign="center" fontSize="lg">
                    בחר את החבילה המתאימה ביותר עבורך
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    {subscriptionTypes.map((sub) => (
                        <Card.Root key={sub.id} bg="dark.card" borderColor="dark.border" borderWidth="1px">
                            <Card.Body>
                                <Flex direction="column" gap={4} h="full">
                                    <Heading size="lg" color="brand.400" textAlign="center">{sub.name}</Heading>

                                    <Flex align="baseline" justify="center" gap={1}>
                                        <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                                            ₪{parseFloat(sub.price).toFixed(0)}
                                        </Text>
                                        <Text color="gray.400">/ {sub.duration_days} ימים</Text>
                                    </Flex>

                                    <Box flex={1}>
                                        {sub.description && sub.description.split('\n').map((feature, idx) => (
                                            <Text key={idx} color="gray.300" mb={2}>
                                                ✓ {feature}
                                            </Text>
                                        ))}
                                    </Box>

                                    <Button
                                        colorPalette="brand"
                                        size="lg"
                                        w="full"
                                        onClick={() => handleSelectPackage(sub.id)}
                                    >
                                        בחר חבילה
                                    </Button>
                                </Flex>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}

export default PricingPage;