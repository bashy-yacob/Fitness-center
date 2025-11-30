import React, { useState, useEffect } from 'react';
import apiService from '../../api/apiService';
import { useAuth } from '../../hooks/useAuth';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Card,
    Text,
    Button,
    Badge,
    Stack,
    Flex,
    Spinner,
    Alert,
    Icon,
    createToaster,
} from '@chakra-ui/react';
import { FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const toaster = createToaster({
    placement: 'top-end',
    duration: 5000,
});

function ClassesListPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true);
                const data = await apiService.get('/classes');
                setClasses(data);
            } catch (err) {
                setError('Failed to load classes. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    const handleRegister = async (classId) => {
        try {
            const response = await apiService.post(`/classes/${classId}/register`);
            toaster.success({
                title: "Success",
                description: response.message || 'Successfully registered for the class!',
            });
        } catch (err) {
            toaster.error({
                title: "Error",
                description: err.response?.data?.message || 'Registration failed.',
            });
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('he-IL', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Container mt={10}>
                <Alert.Root status="error">
                    <Alert.Indicator>
                        <Icon as={FaExclamationCircle} />
                    </Alert.Indicator>
                    <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
            </Container>
        );
    }

    return (
        <Box bg="dark.bg" minH="100vh" py={10}>
            <Container maxW="container.xl">
                <Heading mb={8} color="brand.500">Available Classes</Heading>
                {classes.length === 0 ? (
                    <Alert.Root status="info" bg="dark.card" color="white" borderColor="dark.border" borderWidth="1px">
                        <Alert.Indicator>
                            <Icon as={FaInfoCircle} />
                        </Alert.Indicator>
                        <Alert.Title>No classes are available at the moment.</Alert.Title>
                    </Alert.Root>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                        {classes.map(classItem => (
                            <Card.Root
                                key={classItem.id}
                                bg="dark.card"
                                borderColor="dark.border"
                                borderWidth="1px"
                                _hover={{ borderColor: 'brand.400', transform: 'translateY(-4px)', transition: 'all 0.3s' }}
                            >
                                <Card.Header>
                                    <Heading size="md" color="brand.400">{classItem.name}</Heading>
                                </Card.Header>
                                <Card.Body>
                                    <Stack gap={3}>
                                        <Text color="gray.300">{classItem.description}</Text>
                                        <Flex justify="space-between" align="center">
                                            <Badge colorPalette="purple">
                                                {formatDateTime(classItem.start_time)}
                                            </Badge>
                                            <Text fontSize="sm" color="gray.400">
                                                Capacity: {classItem.registrations_count || 0} / {classItem.max_capacity}
                                            </Text>
                                        </Flex>
                                    </Stack>
                                </Card.Body>
                                <Card.Footer>
                                    {user && user.user_type === 'trainee' && (
                                        <Button
                                            colorPalette="brand"
                                            w="full"
                                            onClick={() => handleRegister(classItem.id)}
                                            disabled={(classItem.registrations_count || 0) >= classItem.max_capacity}
                                        >
                                            {(classItem.registrations_count || 0) >= classItem.max_capacity ? 'Full' : 'Register'}
                                        </Button>
                                    )}
                                </Card.Footer>
                            </Card.Root>
                        ))}
                    </SimpleGrid>
                )}
            </Container>
        </Box>
    );
}

export default ClassesListPage;