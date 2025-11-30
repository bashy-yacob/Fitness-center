import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { Box, Container, Heading, Text, SimpleGrid, Flex, Spinner, Card, Button, Dialog, Badge } from '@chakra-ui/react';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getDayIndex(dateStr) {
  return new Date(dateStr).getDay();
}

const Schedule = ({ trainerId }) => {
  const [schedule, setSchedule] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await apiService.get(`/trainer/${trainerId}/schedule`);
        setSchedule(data);
      } catch (err) {
        setError('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };
    if (trainerId) fetchSchedule();
  }, [trainerId]);

  const weekSchedule = daysOfWeek.map((day, idx) => ({
    day,
    classes: schedule.filter(cls => getDayIndex(cls.start_time) === idx),
  }));

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" />
        <Text ml={4} color="white">טוען נתונים...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box bg="dark.bg" py={10}>
      <Container maxW="container.xl">
        <Heading mb={8} color="brand.500" textAlign="center">מערכת שעות שבועית של המאמן</Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} gap={4}>
          {weekSchedule.map(({ day, classes }) => (
            <Box key={day} bg="dark.card" p={4} borderRadius="md" borderWidth="1px" borderColor="dark.border">
              <Heading size="sm" mb={4} color="brand.400" textAlign="center" borderBottomWidth="1px" borderColor="gray.700" pb={2}>
                {day}
              </Heading>

              {classes.length === 0 ? (
                <Text color="gray.500" textAlign="center" fontSize="sm">אין חוגים</Text>
              ) : (
                <Flex direction="column" gap={3}>
                  {classes.map(cls => (
                    <Card.Root
                      key={cls.id}
                      bg="dark.bg"
                      borderColor="gray.700"
                      borderWidth="1px"
                      cursor="pointer"
                      onClick={() => setSelectedClass(cls)}
                      _hover={{ borderColor: 'brand.500', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
                    >
                      <Card.Body p={3}>
                        <Text fontWeight="bold" color="white" fontSize="sm">{cls.name}</Text>
                        <Text color="brand.300" fontSize="xs">
                          {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                        </Text>
                        <Text color="gray.400" fontSize="xs">חדר: {cls.room}</Text>
                        <Badge colorPalette="blue" size="sm" mt={2}>
                          {cls.traineeCount} מתאמנים
                        </Badge>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </Flex>
              )}
            </Box>
          ))}
        </SimpleGrid>

        {/* Class Details Dialog */}
        <Dialog.Root open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="dark.card" borderColor="dark.border">
              <Dialog.CloseTrigger color="gray.400" />
              <Dialog.Header>
                <Dialog.Title color="brand.400">{selectedClass?.name}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedClass && (
                  <Flex direction="column" gap={3}>
                    <Text color="white">
                      <Text as="span" fontWeight="bold" color="brand.400">שעה:</Text> {formatTime(selectedClass.start_time)} - {formatTime(selectedClass.end_time)}
                    </Text>
                    <Text color="white">
                      <Text as="span" fontWeight="bold" color="brand.400">חדר:</Text> {selectedClass.room}
                    </Text>
                    <Text color="white">
                      <Text as="span" fontWeight="bold" color="brand.400">מתאמנים רשומים:</Text> {selectedClass.traineeCount}
                    </Text>
                  </Flex>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setSelectedClass(null)} colorPalette="brand">סגור</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

      </Container>
    </Box>
  );
};

export default Schedule;
