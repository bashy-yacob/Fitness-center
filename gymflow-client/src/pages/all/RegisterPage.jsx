import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Input, Button, Text, SimpleGrid, Flex, Field, NativeSelect, Alert, Card, Link } from '@chakra-ui/react';

function RegisterPage() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const registrationData = {
            ...formData,
            user_type: 'trainee'
        };

        try {
            const response = await register(registrationData);
            setSuccessMessage(response.message + " You will be redirected to the login page.");

            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                phone_number: '',
                date_of_birth: '',
                gender: ''
            });

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error("Registration Error:", err);
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                setError(err.response.data.errors.map(error => `• ${error}`).join('\n'));
            } else {
                setError(err.response?.data?.error || 'Registration failed. Please try again.');
            }
        }
    };

    return (
        <Box bg="dark.bg" minH="100vh" py={20}>
            <Container maxW="container.md">
                <Flex direction="column" gap={8}>
                    <Heading color="brand.500" textAlign="center">Register for GymFlow</Heading>

                    <Card.Root w="full" bg="dark.card" borderColor="dark.border" borderWidth="1px">
                        <Card.Body>
                            <form onSubmit={handleSubmit}>
                                <Flex direction="column" gap={4}>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                        <Field.Root required>
                                            <Field.Label color="brand.400">First Name</Field.Label>
                                            <Input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                bg="dark.bg"
                                                borderColor="dark.border"
                                                color="white"
                                                _focus={{ borderColor: 'brand.400' }}
                                            />
                                        </Field.Root>

                                        <Field.Root required>
                                            <Field.Label color="brand.400">Last Name</Field.Label>
                                            <Input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                bg="dark.bg"
                                                borderColor="dark.border"
                                                color="white"
                                                _focus={{ borderColor: 'brand.400' }}
                                            />
                                        </Field.Root>
                                    </SimpleGrid>

                                    <Field.Root required>
                                        <Field.Label color="brand.400">Email</Field.Label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            bg="dark.bg"
                                            borderColor="dark.border"
                                            color="white"
                                            _focus={{ borderColor: 'brand.400' }}
                                        />
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label color="brand.400">Password</Field.Label>
                                        <Input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            bg="dark.bg"
                                            borderColor="dark.border"
                                            color="white"
                                            _focus={{ borderColor: 'brand.400' }}
                                        />
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label color="brand.400">Phone Number (Optional)</Field.Label>
                                        <Input
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            bg="dark.bg"
                                            borderColor="dark.border"
                                            color="white"
                                            _focus={{ borderColor: 'brand.400' }}
                                        />
                                    </Field.Root>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                        <Field.Root required>
                                            <Field.Label color="brand.400">Date of Birth</Field.Label>
                                            <Input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                                bg="dark.bg"
                                                borderColor="dark.border"
                                                color="white"
                                                _focus={{ borderColor: 'brand.400' }}
                                            />
                                        </Field.Root>

                                        <Field.Root required>
                                            <Field.Label color="brand.400">Gender</Field.Label>
                                            <NativeSelect.Root>
                                                <NativeSelect.Field
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    bg="dark.bg"
                                                    borderColor="dark.border"
                                                    color="white"
                                                    _focus={{ borderColor: 'brand.400' }}
                                                >
                                                    <option value="" disabled>Select...</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </NativeSelect.Field>
                                            </NativeSelect.Root>
                                        </Field.Root>
                                    </SimpleGrid>

                                    {error && (
                                        <Alert.Root status="error">
                                            <Alert.Title>
                                                {error.split('\n').map((line, index) => (
                                                    <Text key={index}>{line}</Text>
                                                ))}
                                            </Alert.Title>
                                        </Alert.Root>
                                    )}

                                    {successMessage && (
                                        <Alert.Root status="success">
                                            <Alert.Title>{successMessage}</Alert.Title>
                                        </Alert.Root>
                                    )}

                                    <Button
                                        type="submit"
                                        colorPalette="brand"
                                        w="full"
                                        size="lg"
                                        mt={4}
                                    >
                                        Create Account
                                    </Button>

                                    <Text color="gray.400" pt={2} textAlign="center">
                                        Already have an account?{' '}
                                        <Link asChild color="brand.400">
                                            <RouterLink to="/login">Login here</RouterLink>
                                        </Link>
                                    </Text>
                                </Flex>
                            </form>
                        </Card.Body>
                    </Card.Root>
                </Flex>
            </Container>
        </Box>
    );
}

export default RegisterPage;