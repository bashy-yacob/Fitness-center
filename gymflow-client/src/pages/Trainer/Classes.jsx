import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../api/apiService';
import { Box, Container, Heading, Button, Flex, Table, Input, Dialog, Field, SimpleGrid, Text, Textarea } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'top',
  duration: 5000,
});

const TrainerClassesPage = () => {
  const { user } = useAuth();
  const trainerId = user?.id;

  const [classes, setClasses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', start_time: '', end_time: '', room_id: '', max_capacity: '' });
  const [sendMsgClassId, setSendMsgClassId] = useState(null);
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    if (!trainerId) return;
    fetchClasses();
  }, [trainerId]);

  const fetchClasses = async () => {
    if (!trainerId) return;
    try {
      const data = await apiService.get(`/trainer/${trainerId}/classes/upcoming`);
      setClasses(data);
    } catch (err) {
      console.error('fetchClasses: error', err);
    }
  };

  const fetchParticipants = async (classId) => {
    try {
      const data = await apiService.get(`/classes/${classId}/registrations`);
      setParticipants(data);
      setShowParticipants(true);
    } catch (err) {
      console.error('fetchParticipants: error', err);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await apiService.post(`/trainer/${trainerId}/classes`, form);
      setShowCreateForm(false);
      fetchClasses();
      toaster.success({ title: 'החוג נוצר בהצלחה' });
    } catch (err) {
      console.error('handleCreateClass: error', err);
      toaster.error({ title: 'שגיאה ביצירת החוג' });
    }
  };

  const handleSendMessage = async (classId) => {
    try {
      await apiService.post(`/trainer/${trainerId}/messages/send-class`, { classId, messageText: msgText });
      setSendMsgClassId(null);
      setMsgText('');
      toaster.success({ title: 'ההודעה נשלחה בהצלחה' });
    } catch (err) {
      console.error('handleSendMessage: error', err);
      toaster.error({ title: 'שגיאה בשליחת ההודעה' });
    }
  };

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" mb={8}>
          <Heading color="brand.500">ניהול חוגים</Heading>
          <Button onClick={() => setShowCreateForm(true)} colorPalette="brand">
            צור חוג חדש
          </Button>
        </Flex>

        <Box overflowX="auto">
          <Table.Root variant="outline" bg="dark.card">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader color="brand.400">שם</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">תיאור</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">התחלה</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">סיום</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">חדר</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">משתתפים</Table.ColumnHeader>
                <Table.ColumnHeader color="brand.400">שלח הודעה</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {classes.map(c => (
                <Table.Row key={c.id}>
                  <Table.Cell color="white">{c.name}</Table.Cell>
                  <Table.Cell color="white">{c.description}</Table.Cell>
                  <Table.Cell color="white">{new Date(c.start_time).toLocaleString('he-IL')}</Table.Cell>
                  <Table.Cell color="white">{new Date(c.end_time).toLocaleString('he-IL')}</Table.Cell>
                  <Table.Cell color="white">{c.room_id}</Table.Cell>
                  <Table.Cell>
                    <Button size="sm" variant="outline" onClick={() => fetchParticipants(c.id)}>צפייה</Button>
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="sm" colorPalette="brand" onClick={() => setSendMsgClassId(c.id)}>שלח הודעה</Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        {/* Create Class Dialog */}
        <Dialog.Root open={showCreateForm} onOpenChange={() => setShowCreateForm(false)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="dark.card" borderColor="dark.border">
              <Dialog.CloseTrigger color="gray.400" />
              <Dialog.Header>
                <Dialog.Title color="brand.400">צור חוג חדש</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleCreateClass}>
                  <Flex direction="column" gap={4}>
                    <Field.Root required>
                      <Field.Label color="gray.300">שם החוג</Field.Label>
                      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} bg="dark.bg" color="white" borderColor="dark.border" />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label color="gray.300">תיאור</Field.Label>
                      <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} bg="dark.bg" color="white" borderColor="dark.border" />
                    </Field.Root>
                    <SimpleGrid columns={2} gap={4}>
                      <Field.Root required>
                        <Field.Label color="gray.300">התחלה</Field.Label>
                        <Input type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label color="gray.300">סיום</Field.Label>
                        <Input type="datetime-local" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                    </SimpleGrid>
                    <SimpleGrid columns={2} gap={4}>
                      <Field.Root required>
                        <Field.Label color="gray.300">מספר חדר</Field.Label>
                        <Input value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label color="gray.300">מקסימום משתתפים</Field.Label>
                        <Input type="number" value={form.max_capacity} onChange={e => setForm({ ...form, max_capacity: e.target.value })} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                    </SimpleGrid>
                    <Button type="submit" colorPalette="brand" w="full" mt={4}>צור</Button>
                  </Flex>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Send Message Dialog */}
        <Dialog.Root open={!!sendMsgClassId} onOpenChange={() => setSendMsgClassId(null)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="dark.card" borderColor="dark.border">
              <Dialog.CloseTrigger color="gray.400" />
              <Dialog.Header>
                <Dialog.Title color="brand.400">שלח הודעה למשתתפי החוג</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Field.Root>
                  <Field.Label color="gray.300">תוכן ההודעה</Field.Label>
                  <Textarea value={msgText} onChange={e => setMsgText(e.target.value)} bg="dark.bg" color="white" borderColor="dark.border" rows={4} />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setSendMsgClassId(null)}>ביטול</Button>
                <Button colorPalette="brand" onClick={() => handleSendMessage(sendMsgClassId)}>שלח</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Participants Dialog */}
        <Dialog.Root open={showParticipants} onOpenChange={() => setShowParticipants(false)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="dark.card" borderColor="dark.border">
              <Dialog.CloseTrigger color="gray.400" />
              <Dialog.Header>
                <Dialog.Title color="brand.400">משתתפי החוג</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {participants.length === 0 ? (
                  <Text color="gray.400">אין נרשמים לחוג זה.</Text>
                ) : (
                  <Box as="ul" listStyleType="none" p={0}>
                    {participants.map(p => (
                      <Box as="li" key={p.trainee_id} py={2} borderBottomWidth="1px" borderColor="gray.700" color="gray.300">
                        {p.first_name} {p.last_name} ({p.email})
                      </Box>
                    ))}
                  </Box>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

      </Container>
    </Box>
  );
};

export default TrainerClassesPage;
