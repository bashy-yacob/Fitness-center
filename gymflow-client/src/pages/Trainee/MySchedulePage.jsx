import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../api/apiService';
import { Box, Container, Heading, Text, Button, Flex, Spinner, Alert, Table } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
    placement: 'top',
    duration: 5000,
});

function MySchedulePage() {
    const [myClasses, setMyClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [unregisteringId, setUnregisteringId] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyClasses = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                const response = await apiService.get('/classes/my-registrations');
                setMyClasses(response);
            } catch (err) {
                setError('אירעה שגיאה בטעינת מערך השיעורים שלך.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyClasses();
    }, [user]);

    const handleUnregister = async (classId) => {
        const confirmMessage = "האם לבטל את ההרשמה לחוג?\nשים/י לב: הנהלת המכון תיצור עמך קשר לגבי ההחזר הכספי.";
        if (!window.confirm(confirmMessage)) return;

        setUnregisteringId(classId);
        setError('');

        try {
            await apiService.delete(`/classes/${classId}/unregister`);

            setMyClasses(prevClasses =>
                prevClasses.map(cls =>
                    cls.id === classId ? { ...cls, status: 'cancelled' } : cls
                )
            );

            toaster.success({
                title: 'ההרשמה בוטלה בהצלחה.',
            });

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'ביטול ההרשמה נכשל. אנא נסה/י שוב.';
            toaster.error({
                title: `שגיאה: ${errorMessage}`,
            });
            setError(errorMessage);
        } finally {
            setUnregisteringId(null);
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
                <Spinner size="xl" color="brand.500" />
                <Text ml={4} color="white">טוען את מערך השיעורים שלך...</Text>
            </Flex>
        );
    }

    return (
        <Box bg="dark.bg" minH="100vh" py={10}>
            <Container maxW="container.xl">
                <Heading mb={8} color="brand.500">מערך השיעורים שלי</Heading>

                {error && (
                    <Alert.Root status="error" mb={4}>
                        <Alert.Title>{error}</Alert.Title>
                    </Alert.Root>
                )}

                {myClasses.length === 0 ? (
                    <Text color="gray.400" fontSize="lg" textAlign="center" py={10}>
                        עדיין לא נרשמת לאף חוג. זה הזמן להתחיל!
                    </Text>
                ) : (
                    <Box overflowX="auto">
                        <Table.Root variant="outline" bg="dark.card">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader color="brand.400">שם החוג</Table.ColumnHeader>
                                    <Table.ColumnHeader color="brand.400">מאמן/ת</Table.ColumnHeader>
                                    <Table.ColumnHeader color="brand.400">תאריך ושעה</Table.ColumnHeader>
                                    <Table.ColumnHeader color="brand.400">סטטוס</Table.ColumnHeader>
                                    <Table.ColumnHeader color="brand.400">פעולות</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {myClasses.map(cls => (
                                    <Table.Row key={cls.id}>
                                        <Table.Cell color="white">{cls.name}</Table.Cell>
                                        <Table.Cell color="white">{cls.trainer_name}</Table.Cell>
                                        <Table.Cell color="white">
                                            {new Date(cls.start_time).toLocaleString('he-IL', {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Box
                                                as="span"
                                                px={3}
                                                py={1}
                                                borderRadius="md"
                                                bg={cls.status === 'registered' ? 'green.600' : cls.status === 'cancelled' ? 'red.600' : 'gray.600'}
                                                color="white"
                                                fontSize="sm"
                                            >
                                                {cls.status || 'לא ידוע'}
                                            </Box>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {cls.status === 'registered' && (
                                                <Button
                                                    onClick={() => handleUnregister(cls.id)}
                                                    disabled={unregisteringId === cls.id}
                                                    loading={unregisteringId === cls.id}
                                                    colorPalette="red"
                                                    size="sm"
                                                >
                                                    {unregisteringId === cls.id ? 'מבטל...' : 'בטל הרשמה'}
                                                </Button>
                                            )}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default MySchedulePage;