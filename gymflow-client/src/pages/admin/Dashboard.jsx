import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { Box, Container, Heading, SimpleGrid, Flex, Spinner, Button, Card, Text } from '@chakra-ui/react';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiService.get('/admin/reports/summary')
      .then(data => {
        setStats(data);
      })
      .catch((err) => {
        setError('שגיאה בטעינת נתוני דשבורד');
      });
  }, []);

  if (error) {
    return (
      <Flex justify="center" mt={10}>
        <Text color="red.500">{error}</Text>
      </Flex>
    );
  }

  if (!stats) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" />
        <Text ml={4} color="white">טוען נתונים...</Text>
      </Flex>
    );
  }

  const barData = {
    labels: ['משתמשים', 'הכנסות (₪)', 'חוגים פעילים'],
    datasets: [
      {
        label: 'סטטיסטיקות כלליות',
        data: [stats.userCount, stats.monthlyRevenue, stats.activeClassesCount],
        backgroundColor: ['#36A2EB', '#4BC0C0', '#FF6384'],
      },
    ],
  };

  const pieData = {
    labels: ['משתמשים', 'חוגים פעילים'],
    datasets: [
      {
        data: [stats.userCount, stats.activeClassesCount],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading mb={8} color="brand.500">דשבורד מנהל</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={10}>
          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Box h="300px">
                <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } }, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } } }} />
              </Box>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
            <Card.Body>
              <Box h="300px" display="flex" justifyContent="center">
                <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } } }} />
              </Box>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Flex gap={4} wrap="wrap" justify="center">
          <Button onClick={() => navigate('/admin/users')} colorPalette="brand" variant="outline">ניהול משתמשים</Button>
          <Button onClick={() => navigate('/admin/classes')} colorPalette="brand" variant="outline">ניהול חוגים</Button>
          <Button onClick={() => navigate('/admin/packages')} colorPalette="brand" variant="outline">ניהול סוגי מנויים</Button>
          <Button onClick={() => navigate('/admin/payments')} colorPalette="brand" variant="outline">ניהול תשלומים</Button>
        </Flex>
      </Container>
    </Box>
  );
}
