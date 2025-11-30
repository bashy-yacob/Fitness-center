import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Heading, Text, SimpleGrid, Button, Flex, Card, List, Link } from '@chakra-ui/react';

function TrainerDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const { user } = useAuth();
  const trainerId = user?.id;

  useEffect(() => {
    if (!trainerId) return;
    apiService.get(`/trainer/${trainerId}/dashboard/summary`).then(setSummary);
    apiService.get(`/trainer/${trainerId}/classes/upcoming`).then(setUpcomingClasses);
    apiService.get(`/trainer/${trainerId}/messages/recent`).then(setRecentMessages);
  }, [trainerId]);

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading mb={8} color="brand.500">🏠 דשבורד מאמן</Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Flex direction="column" align="center">
                <Text color="gray.400" fontSize="lg">כמות חוגים</Text>
                <Text color="brand.500" fontSize="4xl" fontWeight="bold">{summary?.classesCount ?? '-'}</Text>
              </Flex>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Flex direction="column" align="center">
                <Text color="gray.400" fontSize="lg">מתאמנים פעילים</Text>
                <Text color="brand.500" fontSize="4xl" fontWeight="bold">{summary?.activeTrainees ?? '-'}</Text>
              </Flex>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Flex direction="column" align="center">
                <Text color="gray.400" fontSize="lg">הודעות אחרונות</Text>
                <Text color="brand.500" fontSize="4xl" fontWeight="bold">{recentMessages.length}</Text>
              </Flex>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px" mb={8}>
          <Card.Body>
            <Heading size="md" mb={4} color="brand.400">לוח חוגים שבועי (מוקטן)</Heading>
            {upcomingClasses.length === 0 ? (
              <Text color="gray.400">אין חוגים קרובים</Text>
            ) : (
              <List.Root spacing={2}>
                {upcomingClasses.map(cls => (
                  <List.Item key={cls.id} color="gray.300">
                    <List.Indicator color="brand.500">📅</List.Indicator>
                    {cls.day} {cls.time} - {cls.title}
                  </List.Item>
                ))}
              </List.Root>
            )}
          </Card.Body>
        </Card.Root>

        <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
          <Card.Body>
            <Heading size="md" mb={4} color="brand.400">קיצורי דרך</Heading>
            <Flex gap={4} wrap="wrap">
              <Link asChild>
                <RouterLink to="/trainer/classes">
                  <Button colorPalette="brand" variant="outline">הוסף חוג</Button>
                </RouterLink>
              </Link>
              <Link asChild>
                <RouterLink to="/trainer/messages">
                  <Button colorPalette="brand" variant="outline">הודעות</Button>
                </RouterLink>
              </Link>
              <Link asChild>
                <RouterLink to="/trainer/trainees">
                  <Button colorPalette="brand" variant="outline">רשימת מתאמנים</Button>
                </RouterLink>
              </Link>
            </Flex>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
}

export default TrainerDashboardPage;
