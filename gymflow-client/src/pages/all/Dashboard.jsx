import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import TraineeDashboardPage from '../Trainee/Dashboard.jsx';
import TrainerDashboardPage from '../Trainer/Dashboard.jsx';
import AdminDashboardPage from '../admin/Dashboard.jsx';
import { Flex, Spinner, Text, Box, Container, Alert, Icon } from '@chakra-ui/react';
import { FaExclamationTriangle } from 'react-icons/fa';

function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
                <Text ml={4} color="white">Loading...</Text>
            </Flex>
        );
    }

    switch (user.user_type) {
        case 'admin':
            return <AdminDashboardPage />;
        case 'trainer':
            return <TrainerDashboardPage />;
        case 'trainee':
            return <TraineeDashboardPage />;
        default:
            return (
                <Box bg="dark.bg" minH="100vh" py={10}>
                    <Container>
                        <Alert.Root status="warning">
                            <Alert.Indicator>
                                <Icon as={FaExclamationTriangle} />
                            </Alert.Indicator>
                            <Alert.Title>Unknown user type.</Alert.Title>
                        </Alert.Root>
                    </Container>
                </Box>
            );
    }
}

export default Dashboard;