import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
    Box,
    Container,
    Heading,
    Field,
    Input,
    Button,
    Alert,
    Icon,
    Link,
    Stack,
    Text,
    Card,
} from '@chakra-ui/react';
import { FaExclamationCircle } from 'react-icons/fa';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = await auth.login(email, password);
            const decodedToken = jwtDecode(token);
            let targetPath = '/dashboard';
            if (decodedToken.user_type === 'trainer') {
                targetPath = '/trainer/dashboard';
            } else if (decodedToken.user_type === 'trainee') {
                targetPath = '/trainee/dashboard';
            } else if (decodedToken.user_type === 'admin') {
                targetPath = '/admin/dashboard';
            }
            navigate(targetPath, { replace: true });
        } catch (err) {
            let msg = 'התחברות נכשלה. ודא/י שהאימייל והסיסמה נכונים.';
            if (err.response?.data?.message) {
                msg += `\nפרטי שגיאה: ${err.response.data.message}`;
            } else if (err.message) {
                msg += `\n${err.message}`;
            }
            setError(msg);
            console.error(err);
        }
    };

    return (
        <Box bg="dark.bg" minH="100vh" py={20}>
            <Container maxW="container.sm">
                <Stack direction="column" gap={8}>
                    <Heading color="brand.500">Login to GymFlow</Heading>
                    <Card.Root w="full" bg="dark.card" borderColor="dark.border" borderWidth="1px">
                        <Card.Body>
                            <form onSubmit={handleSubmit}>
                                <Stack direction="column" gap={4}>
                                    <Field.Root required>
                                        <Field.Label color="brand.400">Email</Field.Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            bg="dark.bg"
                                            borderColor="dark.border"
                                            _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)' }}
                                            color="white"
                                        />
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label color="brand.400">Password</Field.Label>
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            bg="dark.bg"
                                            borderColor="dark.border"
                                            _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)' }}
                                            color="white"
                                        />
                                    </Field.Root>

                                    {error && (
                                        <Alert.Root status="error">
                                            <Alert.Indicator>
                                                <Icon as={FaExclamationCircle} />
                                            </Alert.Indicator>
                                            <Alert.Title>{error}</Alert.Title>
                                        </Alert.Root>
                                    )}

                                    <Button
                                        type="submit"
                                        colorPalette="brand"
                                        w="full"
                                        size="lg"
                                        mt={4}
                                    >
                                        Log In
                                    </Button>

                                    <Text color="gray.400" pt={2}>
                                        Don't have an account?{' '}
                                        <Link asChild color="brand.400">
                                            <RouterLink to="/register">Register here</RouterLink>
                                        </Link>
                                    </Text>
                                </Stack>
                            </form>
                        </Card.Body>
                    </Card.Root>
                </Stack>
            </Container>
        </Box>
    );
}

export default LoginPage;