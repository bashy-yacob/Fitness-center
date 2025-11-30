import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { useAuth } from '../hooks/useAuth';
import apiService from '../api/apiService';
import { Box, Container, Heading, SimpleGrid, Flex, Spinner, Table, Text, Card } from '@chakra-ui/react';

const TrainerStats = () => {
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [statsPerTrainee, setStatsPerTrainee] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const trainerId = user?.id;

  useEffect(() => {
    if (!trainerId) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [attendanceRes, traineeRes] = await Promise.all([
          apiService.get(`/trainer/${trainerId}/stats/attendance-summary`),
          apiService.get(`/trainer/${trainerId}/stats/by-trainee`),
        ]);
        setAttendanceSummary(attendanceRes);
        setStatsPerTrainee(traineeRes);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchStats();
  }, [trainerId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" />
        <Text ml={4} color="white">טוען נתונים...</Text>
      </Flex>
    );
  }

  if (!attendanceSummary || !statsPerTrainee) {
    return (
      <Flex justify="center" mt={10}>
        <Text color="gray.500">לא נמצאו נתונים</Text>
      </Flex>
    );
  }

  const barData = {
    labels: attendanceSummary?.classes,
    datasets: [
      {
        label: 'מספר משתתפים',
        data: attendanceSummary?.counts,
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const pieData = {
    labels: ['נוכחות', 'היעדרות'],
    datasets: [
      {
        data: attendanceSummary?.attendancePie,
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading mb={8} color="brand.500">סטטיסטיקות מאמן</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={10}>
          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Heading size="md" mb={4} color="brand.400">משתתפים לפי חוג</Heading>
              <Box h="300px">
                <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } }, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } } }} />
              </Box>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Heading size="md" mb={4} color="brand.400">נוכחות/היעדרות</Heading>
              <Box h="300px" display="flex" justifyContent="center">
                <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } } }} />
              </Box>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Heading size="lg" mb={6} color="brand.500">טבלת נוכחות לפי מתאמן</Heading>
        <Box overflowX="auto">
          <Table.Root variant="outline" bg="dark.card">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader color="brand.400">שם מתאמן</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">מספר חוגים</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">נוכח</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">היעדר</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(statsPerTrainee?.trainees || []).map((t, i) => (
                <Table.Row key={i}>
                  <Table.Cell color="white">{t.name}</Table.Cell>
                  <Table.Cell color="white">{t.total}</Table.Cell>
                  <Table.Cell color="white">{t.present}</Table.Cell>
                  <Table.Cell color="white">{t.absent}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Container>
    </Box>
  );
};

export default TrainerStats;
