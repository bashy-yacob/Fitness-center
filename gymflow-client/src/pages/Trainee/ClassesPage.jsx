import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../api/apiService';
import PaymentModal from '../../components/PaymentModal';
import { Box, Container, Heading, Text, SimpleGrid, Button, Flex, Spinner, Alert, Card } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
    placement: 'top',
    duration: 5000,
});

function ClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClassForPayment, setSelectedClassForPayment] = useState(null);
    const { user } = useAuth();
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchAvailableClasses = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const availableClasses = await apiService.get('/classes');
                setClasses(availableClasses);
            } catch (err) {
                toaster.error({
                    title: 'אירעה שגיאה בטעינת החוגים.',
                });
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailableClasses();
    }, [user]);

    const handleOpenPaymentModal = (gymClass) => {
        setSelectedClassForPayment(gymClass);
    };

    const handleConfirmPayment = async (classId) => {
        setSelectedClassForPayment(null);
        setProcessingId(classId);

        try {
            await apiService.post(`/classes/${classId}/pay-and-register`, {});

            setClasses(currentClasses => currentClasses.map(cls =>
                cls.id === classId ? { ...cls, isRegistered: true, availableSlots: cls.availableSlots - 1, registeredCount: cls.registeredCount + 1 } : cls
            ));

            toaster.success({
                title: 'נרשמת בהצלחה לחוג!',
            });

        } catch (err) {
            const errorMessage = err.response?.data?.error || 'ההרשמה נכשלה. אנא נסה/י שוב.';
            toaster.error({
                title: errorMessage,
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
                <Text ml={4} color="white">טוען חוגים זמינים...</Text>
            </Flex>
        );
    }

    return (
        <Box bg="dark.bg" minH="100vh" py={10}>
            <Container maxW="container.xl">
                <Heading mb={8} color="brand.500">חוגים פתוחים להרשמה</Heading>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    {classes.map(cls => (
                        <Card.Root key={cls.id} bg="dark.card" borderColor="dark.border" borderWidth="1px">
                            <Card.Body>
                                <Flex direction="column" gap={4}>
                                    <Heading size="md" color="brand.400">{cls.name}</Heading>

                                    <Box>
                                        <Text color="gray.300">
                                            <Text as="span" fontWeight="bold" color="brand.400">מאמן/ה:</Text> {cls.trainerName}
                                        </Text>
                                        <Text color="gray.300">
                                            <Text as="span" fontWeight="bold" color="brand.400">תאריך ושעה:</Text> {new Date(cls.startTime).toLocaleString('he-IL')}
                                        </Text>
                                        <Text color="gray.300">
                                            <Text as="span" fontWeight="bold" color="brand.400">מקומות פנויים:</Text> {cls.availableSlots} / {cls.maxCapacity}
                                        </Text>
                                    </Box>

                                    <Button
                                        onClick={() => handleOpenPaymentModal(cls)}
                                        disabled={cls.availableSlots <= 0 || cls.isRegistered || processingId === cls.id}
                                        colorPalette={cls.isRegistered ? 'green' : 'brand'}
                                        loading={processingId === cls.id}
                                        w="full"
                                    >
                                        {processingId === cls.id ? 'מעבד...' : (cls.isRegistered ? 'נרשמת' : (cls.availableSlots <= 0 ? 'מלא' : 'הירשם'))}
                                    </Button>
                                </Flex>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </SimpleGrid>

                {selectedClassForPayment && (
                    <PaymentModal
                        gymClass={selectedClassForPayment}
                        onClose={() => setSelectedClassForPayment(null)}
                        onConfirm={handleConfirmPayment}
                    />
                )}
            </Container>
        </Box>
    );
}

export default ClassesPage;