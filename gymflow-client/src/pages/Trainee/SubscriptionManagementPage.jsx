import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../api/apiService';
import { Box, Container, Heading, Text, Button, Flex, Spinner, Alert, Card, Link } from '@chakra-ui/react';

const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

function SubscriptionManagementPage() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const activeSubscription = await apiService.get('/subscriptions/my-active-subscription');
                setSubscription(activeSubscription);
            } catch (err) {
                console.error("Failed to fetch subscription data:", err);
                setError('אירעה שגיאה בטעינת נתוני המנוי.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [user]);

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
                <Text ml={4} color="white">טוען מידע על המנוי...</Text>
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

    const daysLeft = calculateDaysLeft(subscription?.end_date);

    return (
        <Box bg="dark.bg" minH="100vh" py={10}>
            <Container maxW="container.xl">
                <Heading mb={8} color="brand.500">ניהול מנוי וחיובים</Heading>

                <Flex direction="column" gap={6}>
                    <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
                        <Card.Body>
                            <Heading size="md" mb={4} color="brand.400">המנוי הנוכחי שלי</Heading>
                            {subscription ? (
                                <Flex direction="column" gap={2}>
                                    <Text color="gray.300">
                                        <Text as="span" fontWeight="bold" color="brand.400">סוג המנוי:</Text> {subscription.name}
                                    </Text>
                                    <Text color="gray.300">
                                        <Text as="span" fontWeight="bold" color="brand.400">תוקף עד:</Text> {formatDate(subscription.end_date)}
                                    </Text>
                                    <Text color="gray.300">
                                        <Text as="span" fontWeight="bold" color="brand.400">ימים שנותרו:</Text> {daysLeft} ימים
                                    </Text>
                                    <Text color="gray.300">
                                        <Text as="span" fontWeight="bold" color="brand.400">סטטוס:</Text>{' '}
                                        <Box
                                            as="span"
                                            px={3}
                                            py={1}
                                            borderRadius="md"
                                            bg={daysLeft > 0 ? 'green.600' : 'red.600'}
                                            color="white"
                                            fontSize="sm"
                                        >
                                            {daysLeft > 0 ? 'פעיל' : 'פג תוקף'}
                                        </Box>
                                    </Text>
                                </Flex>
                            ) : (
                                <Text color="gray.400">לא נמצא מנוי פעיל.</Text>
                            )}
                        </Card.Body>
                    </Card.Root>

                    <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
                        <Card.Body>
                            <Heading size="md" mb={4} color="brand.400">פעולות נוספות</Heading>
                            <Link asChild>
                                <RouterLink to="/trainee/subscriptions/pricing">
                                    <Button colorPalette="brand" size="lg" w="full">
                                        {subscription ? 'חידוש / שדרוג מנוי' : 'רכישת מנוי חדש'}
                                    </Button>
                                </RouterLink>
                            </Link>
                        </Card.Body>
                    </Card.Root>
                </Flex>
            </Container>
        </Box>
    );
}

export default SubscriptionManagementPage;