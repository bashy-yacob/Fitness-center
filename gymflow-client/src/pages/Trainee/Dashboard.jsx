import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Box, Container, Heading, Text, SimpleGrid, Button, Flex, Spinner, Alert, Card } from '@chakra-ui/react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const traineeId = user?.id;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!traineeId) {
        setError("לא זוהה משתמש.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await apiService.get(`/trainees/dashboard/${traineeId}`);
        const serverData = response.data;

        const formattedData = {
          subscriptionStatus: serverData.active_subscription ? 'פעיל' : 'לא פעיל',
          subscriptionEndDate: serverData.active_subscription ? new Date(serverData.active_subscription.end_date).toLocaleDateString('he-IL') : 'N/A',
          completedClasses: serverData.attended_classes,
        };
        setDashboardData(formattedData);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("אירעה שגיאה בטעינת הנתונים. אנא נסה/י שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [traineeId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="dark.bg">
        <Spinner size="xl" color="brand.500" />
        <Text ml={4} color="white">טוען נתונים...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Container mt={10}>
        <Alert.Root status="error">
          <Alert.Title>שגיאה: {error}</Alert.Title>
        </Alert.Root>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container mt={10}>
        <Text color="white">לא נמצא מידע עבור לוח הבקרה.</Text>
      </Container>
    );
  }

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading mb={8} color="brand.500">לוח בקרה</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={8}>
          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Heading size="md" mb={4} color="brand.400">סטטוס המנוי</Heading>
              <Text color="gray.300">
                <Text as="span" fontWeight="bold" color="brand.400">מצב:</Text> {dashboardData.subscriptionStatus}
              </Text>
              <Text color="gray.300">
                <Text as="span" fontWeight="bold" color="brand.400">תוקף עד:</Text> {dashboardData.subscriptionEndDate}
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Heading size="md" mb={4} color="brand.400">חוגים שהושלמו</Heading>
              <Text fontSize="4xl" fontWeight="bold" color="brand.500" textAlign="center">
                {dashboardData.completedClasses}
              </Text>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Box>
          <Heading size="lg" mb={4} color="brand.400">פעולות מהירות</Heading>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Button
              onClick={() => navigate('/trainee/classes')}
              colorPalette="brand"
              size="lg"
              flex={1}
            >
              📅 הרשמה לחוג
            </Button>
            <Button
              onClick={() => navigate('/trainee/training-program')}
              colorPalette="brand"
              size="lg"
              flex={1}
            >
              🏋️ צפייה בתוכנית האימון
            </Button>
            <Button
              onClick={() => navigate('/trainee/messages')}
              colorPalette="brand"
              size="lg"
              flex={1}
            >
              💬 שליחת הודעה למאמן
            </Button>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;