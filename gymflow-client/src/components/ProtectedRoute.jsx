import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Flex, Spinner, Text, Alert, Icon, Container } from '@chakra-ui/react';
import { FaExclamationCircle } from 'react-icons/fa';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading, authError } = useAuth();

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
                <Text ml={4} color="white">טוען הרשאות...</Text>
            </Flex>
        );
    }

    if (authError) {
        return (
            <Container mt={10}>
                <Alert.Root status="error">
                    <Alert.Indicator>
                        <Icon as={FaExclamationCircle} />
                    </Alert.Indicator>
                    <Alert.Title>{authError}</Alert.Title>
                </Alert.Root>
            </Container>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.user_type)) {
        const userHomePath = `/${user?.user_type}/dashboard` || '/login';
        return <Navigate to={userHomePath} replace />;
    }

    return children || <Outlet />;
};

export default ProtectedRoute;