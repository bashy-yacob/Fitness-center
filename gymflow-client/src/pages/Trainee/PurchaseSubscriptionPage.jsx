import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { Box, Container, Heading, Text, SimpleGrid, Button, Flex, Spinner, Alert, Card, Dialog } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
    placement: 'top',
    duration: 5000,
});

function PurchaseSubscriptionPage() {
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [purchasing, setPurchasing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubscriptionTypes = async () => {
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

    const handleSelectSubscription = (subscriptionType) => {
        setSelectedSubscription(subscriptionType);
    };

    const handlePurchase = async () => {
        if (!selectedSubscription) return;

        setPurchasing(true);
        try {
            const paymentDetails = {
                transaction_id: `txn_sub_${Date.now()}`,
                status: 'completed',
                notes: null
            };
            const body = {
                subscriptionTypeId: selectedSubscription.id,
                paymentDetails: paymentDetails
            };

            await apiService.post('/subscriptions/purchase', body);

            toaster.success({
                title: 'Subscription purchased successfully!',
            });

            setSelectedSubscription(null);
            navigate('/subscriptions/manage');

        } catch (err) {
            console.error('Failed to purchase subscription:', err);
            toaster.error({
                title: err.response?.data?.error || 'Subscription purchase failed.',
            });
        } finally {
            setPurchasing(false);
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
                                        onClick={() => handleSelectSubscription(sub)}
                                    >
                                        רכוש עכשיו
                                    </Button>
                                </Flex>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </SimpleGrid>

                {selectedSubscription && (
                    <Dialog.Root open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content bg="dark.card" borderColor="dark.border">
                                <Dialog.Header>
                                    <Dialog.Title color="brand.400">אישור רכישה</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <Text color="white">
                                        האם אתה בטוח שברצונך לרכוש את מנוי "{selectedSubscription.name}"?
                                    </Text>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Flex gap={3}>
                                        <Button
                                            onClick={() => setSelectedSubscription(null)}
                                            variant="outline"
                                        >
                                            ביטול
                                        </Button>
                                        <Button
                                            onClick={handlePurchase}
                                            loading={purchasing}
                                            colorPalette="brand"
                                        >
                                            אשר ושלם
                                        </Button>
                                    </Flex>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Dialog.Root>
                )}
            </Container>
        </Box>
    );
}

export default PurchaseSubscriptionPage;