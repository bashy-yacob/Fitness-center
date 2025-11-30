import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../api/apiService';
import { Box, Container, Heading, Text, Button, Flex, Spinner, Alert, Card, Link } from '@chakra-ui/react';

function TrainingProgramPage() {
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchTrainingProgram = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const programData = await apiService.get('/trainees/my-training-program');
                setProgram(programData);
            } catch (err) {
                console.error("Failed to fetch training program:", err);
                setError('אירעה שגיאה בטעינת תוכנית האימונים.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrainingProgram();
    }, [user]);

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
                <Text ml={4} color="white">טוען את תוכנית האימונים שלך...</Text>
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
                <Heading mb={8} color="brand.500">תוכנית האימונים שלי</Heading>

                {program ? (
                    <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
                        <Card.Body>
                            <Flex direction="column" gap={4}>
                                <Heading size="lg" color="brand.400">{program.program_name}</Heading>

                                <Flex gap={6} wrap="wrap">
                                    <Text color="gray.300">
                                        <Text as="span" fontWeight="bold" color="brand.400">מאמן/ת:</Text> {program.trainer_name}
                                    </Text>
                                    <Text color="gray.300">
                                        <Text as="span" fontWeight="bold" color="brand.400">תאריך יצירה:</Text> {new Date(program.created_at).toLocaleDateString('he-IL')}
                                    </Text>
                                </Flex>

                                <Box>
                                    <Heading size="md" mb={3} color="brand.400">תיאור התוכנית:</Heading>
                                    <Text color="gray.300" whiteSpace="pre-wrap">
                                        {program.program_description}
                                    </Text>
                                </Box>
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                ) : (
                    <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
                        <Card.Body>
                            <Flex direction="column" align="center" gap={4} py={8}>
                                <Heading size="lg" color="brand.400">לא הוקצתה לך תוכנית</Heading>
                                <Text color="gray.400" textAlign="center" mb={4}>
                                    עדיין לא הוקצתה לך תוכנית אימונים אישית. פנה/י למאמן/ת שלך לקבלת תוכנית.
                                </Text>
                                <Link asChild>
                                    <RouterLink to="/trainee/messages">
                                        <Button colorPalette="brand" size="lg">
                                            שלח/י הודעה למאמן/ת
                                        </Button>
                                    </RouterLink>
                                </Link>
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                )}
            </Container>
        </Box>
    );
}

export default TrainingProgramPage;