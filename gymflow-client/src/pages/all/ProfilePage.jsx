import React, { useState, useEffect } from 'react';
import apiService from '../../api/apiService';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Heading, Input, Button, Text, SimpleGrid, Flex, Spinner, Field, NativeSelect, Alert, Card, Separator } from '@chakra-ui/react';

function ProfilePage() {
    const { user, updateUserContext } = useAuth();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        gender: '',
        user_type: '',
        profile_picture_url: ''
    });

    const [password, setPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const data = await apiService.get('/users/me');

                const initialData = {
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    email: data.email || '',
                    phone_number: data.phone_number || '',
                    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
                    gender: data.gender || '',
                    user_type: data.user_type || user?.user_type || '',
                    profile_picture_url: data.profile_picture_url || ''
                };

                setFormData(initialData);
            } catch (err) {
                setError('Failed to load profile data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const dataToSend = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number
        };

        if (formData.user_type === 'trainee') {
            dataToSend.date_of_birth = formData.date_of_birth;
            dataToSend.gender = formData.gender;
        }

        if (password) {
            dataToSend.password = password;
        }

        try {
            await apiService.put('/users/me', dataToSend);
            setSuccess('Profile details updated successfully!');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        }
    };

    const handlePictureUpload = async () => {
        if (!selectedFile) return;

        const uploadData = new FormData();
        uploadData.append('profilePicture', selectedFile);

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const response = await apiService.post('/users/me/profile-picture', uploadData);

            setFormData(prev => ({ ...prev, profile_picture_url: response.profile_picture_url }));
            updateUserContext({ ...user, profile_picture_url: response.profile_picture_url });
            setSuccess('Picture uploaded successfully!');
            setSelectedFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Picture upload failed.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
            </Flex>
        );
    }

    const baseImageUrl = 'http://localhost:3000/uploads/';

    return (
        <Box bg="dark.bg" minH="100vh" py={10}>
            <Container maxW="container.xl">
                <Heading mb={8} color="brand.500">Profile</Heading>

                <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
                    {/* Profile Picture Section */}
                    <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
                        <Card.Body>
                            <Flex direction="column" gap={6}>
                                <Heading size="md" color="brand.400">Profile Picture</Heading>

                                {formData.profile_picture_url ? (
                                    <Box
                                        as="img"
                                        src={`${baseImageUrl}${formData.profile_picture_url}`}
                                        alt="Profile"
                                        borderRadius="full"
                                        boxSize="150px"
                                        objectFit="cover"
                                        borderWidth="2px"
                                        borderColor="brand.500"
                                        mx="auto"
                                    />
                                ) : (
                                    <Box
                                        borderRadius="full"
                                        boxSize="150px"
                                        bg="gray.700"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        borderWidth="2px"
                                        borderColor="brand.500"
                                        mx="auto"
                                    >
                                        <Text color="gray.400">No Picture</Text>
                                    </Box>
                                )}

                                <Field.Root>
                                    <Input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={e => setSelectedFile(e.target.files[0])}
                                        pt={1}
                                        bg="dark.bg"
                                        borderColor="dark.border"
                                        color="gray.300"
                                    />
                                </Field.Root>

                                <Button
                                    onClick={handlePictureUpload}
                                    loading={uploading}
                                    disabled={!selectedFile}
                                    colorPalette="brand"
                                    w="full"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Picture'}
                                </Button>
                            </Flex>
                        </Card.Body>
                    </Card.Root>

                    {/* Personal Details Section */}
                    <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px" gridColumn={{ lg: 'span 2' }}>
                        <Card.Body>
                            <Heading size="md" mb={6} color="brand.400">Edit Profile Details</Heading>
                            <form onSubmit={handleDetailsSubmit}>
                                <Flex direction="column" gap={4}>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                                        <Field.Root required>
                                            <Field.Label color="gray.400">First Name</Field.Label>
                                            <Input
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                bg="dark.bg"
                                                borderColor="dark.border"
                                                color="white"
                                            />
                                        </Field.Root>

                                        <Field.Root required>
                                            <Field.Label color="gray.400">Last Name</Field.Label>
                                            <Input
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                bg="dark.bg"
                                                borderColor="dark.border"
                                                color="white"
                                            />
                                        </Field.Root>
                                    </SimpleGrid>

                                    <Field.Root required>
                                        <Field.Label color="gray.400">Email</Field.Label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            bg="dark.bg"
                                            borderColor="dark.border"
                                            color="white"
                                        />
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label color="gray.400">Phone</Field.Label>
                                        <Input
                                            name="phone_number"
                                            type="tel"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            bg="dark.bg"
                                            borderColor="dark.border"
                                            color="white"
                                        />
                                    </Field.Root>

                                    {formData.user_type === 'trainee' && (
                                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                                            <Field.Root>
                                                <Field.Label color="gray.400">Date of Birth</Field.Label>
                                                <Input
                                                    name="date_of_birth"
                                                    type="date"
                                                    value={formData.date_of_birth}
                                                    onChange={handleChange}
                                                    bg="dark.bg"
                                                    borderColor="dark.border"
                                                    color="white"
                                                />
                                            </Field.Root>

                                            <Field.Root>
                                                <Field.Label color="gray.400">Gender</Field.Label>
                                                <NativeSelect.Root>
                                                    <NativeSelect.Field
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        bg="dark.bg"
                                                        borderColor="dark.border"
                                                        color="white"
                                                    >
                                                        <option value="">Select...</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </NativeSelect.Field>
                                                </NativeSelect.Root>
                                            </Field.Root>
                                        </SimpleGrid>
                                    )}

                                    <Separator my={4} borderColor="dark.border" />

                                    <Box w="full">
                                        <Heading size="sm" mb={4} color="brand.400">Change Password</Heading>
                                        <Field.Root>
                                            <Field.Label color="gray.400">New Password</Field.Label>
                                            <Input
                                                name="password"
                                                type="password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="Leave blank to keep current"
                                                bg="dark.bg"
                                                borderColor="dark.border"
                                                color="white"
                                            />
                                        </Field.Root>
                                    </Box>

                                    {error && (
                                        <Alert.Root status="error">
                                            <Alert.Title>{error}</Alert.Title>
                                        </Alert.Root>
                                    )}

                                    {success && (
                                        <Alert.Root status="success">
                                            <Alert.Title>{success}</Alert.Title>
                                        </Alert.Root>
                                    )}

                                    <Button type="submit" colorPalette="brand" size="lg" w="full" mt={4}>
                                        Save Details
                                    </Button>
                                </Flex>
                            </form>
                        </Card.Body>
                    </Card.Root>
                </SimpleGrid>
            </Container>
        </Box>
    );
}

export default ProfilePage;