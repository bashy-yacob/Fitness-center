import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { Box, Container, Heading, Button, Flex, Table, Input, NativeSelect, Checkbox, Dialog, Field, SimpleGrid, Text, Spinner } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'top',
  duration: 5000,
});

const initialFormState = {
  name: '',
  description: '',
  start_time: '',
  end_time: '',
  room_id: '',
  trainer_id: '',
  max_capacity: '',
  is_active: true,
};

export default function ClassesAdminPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchRooms();
    fetchTrainers();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/classes');
      setClasses(data);
    } catch (err) {
      toaster.error({ title: 'שגיאה בטעינת החוגים' });
    }
    setLoading(false);
  };

  const fetchRooms = async () => {
    try {
      const data = await apiService.get('/rooms');
      setRooms(data);
    } catch { }
  };

  const fetchTrainers = async () => {
    try {
      const data = await apiService.get('/users/filter/by-type?type=trainer');
      setTrainers(data);
    } catch { }
  };

  const handleEdit = (cls) => {
    setForm({
      ...cls,
      start_time: cls.startTime ? cls.startTime.slice(0, 16) : '',
      end_time: cls.endTime ? cls.endTime.slice(0, 16) : '',
      room_id: cls.roomId || cls.room_id || '',
      trainer_id: cls.trainerId || cls.trainer_id || '',
      max_capacity: cls.maxCapacity || cls.max_capacity || '',
      is_active: cls.isActive ?? true
    });
    setEditId(cls.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק את החוג?')) return;
    try {
      await apiService.delete(`/classes/${id}`);
      toaster.success({ title: 'החוג נמחק בהצלחה' });
      fetchClasses();
    } catch {
      toaster.error({ title: 'שגיאה במחיקה' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const {
          name,
          description,
          start_time,
          end_time,
          room_id,
          trainer_id,
          max_capacity,
          is_active
        } = form;
        const updateData = {
          name: name ?? '',
          description: description ?? '',
          start_time: start_time ?? '',
          end_time: end_time ?? '',
          room_id: room_id ?? null,
          trainer_id: trainer_id ?? null,
          max_capacity: max_capacity ?? null,
          is_active: typeof is_active === 'boolean' ? is_active : true
        };
        await apiService.put(`/classes/${editId}`, updateData);
        toaster.success({ title: 'החוג עודכן בהצלחה' });
      } else {
        const { is_active, ...formWithoutIsActive } = form;
        await apiService.post('/classes', formWithoutIsActive);
        toaster.success({ title: 'החוג נוצר בהצלחה' });
      }
      setShowForm(false);
      setForm(initialFormState);
      setEditId(null);
      fetchClasses();
    } catch {
      toaster.error({ title: 'שגיאה בשמירה' });
    }
  };

  const selectedTrainerObj = trainers.find(t => String(t.id) === selectedTrainer);
  const selectedTrainerName = selectedTrainerObj ? `${selectedTrainerObj.first_name} ${selectedTrainerObj.last_name}` : '';
  const filteredClasses = selectedTrainer
    ? classes.filter(cls => cls.trainerName === selectedTrainerName)
    : classes;

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading mb={8} color="brand.500">ניהול חוגים</Heading>

        <Flex justify="space-between" mb={6} gap={4} wrap="wrap">
          <Flex gap={4} align="center">
            <Text color="white">סנן לפי מאמן:</Text>
            <Box w="200px">
              <NativeSelect.Root>
                <NativeSelect.Field value={selectedTrainer} onChange={e => setSelectedTrainer(e.target.value)} bg="dark.bg" color="white" borderColor="dark.border">
                  <option value="">הכל</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>
          </Flex>
          <Button onClick={() => { setShowForm(true); setForm(initialFormState); setEditId(null); }} colorPalette="brand">הוסף חוג</Button>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" color="brand.500" />
            <Text ml={4} color="white">טוען...</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table.Root variant="outline" bg="dark.card">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader color="brand.400">שם חוג</Table.ColumnHeader>
                  <Table.ColumnHeader color="brand.400">מאמן</Table.ColumnHeader>
                  <Table.ColumnHeader color="brand.400">חדר</Table.ColumnHeader>
                  <Table.ColumnHeader color="brand.400">התחלה</Table.ColumnHeader>
                  <Table.ColumnHeader color="brand.400">סיום</Table.ColumnHeader>
                  <Table.ColumnHeader color="brand.400">משתתפים</Table.ColumnHeader>
                  <Table.ColumnHeader color="brand.400">פעולות</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredClasses.map(cls => (
                  <Table.Row key={cls.id}>
                    <Table.Cell color="white">{cls.name}</Table.Cell>
                    <Table.Cell color="white">{cls.trainerName}</Table.Cell>
                    <Table.Cell color="white">{cls.roomName}</Table.Cell>
                    <Table.Cell color="white">{new Date(cls.startTime).toLocaleString('he-IL')}</Table.Cell>
                    <Table.Cell color="white">{new Date(cls.endTime).toLocaleString('he-IL')}</Table.Cell>
                    <Table.Cell color="white">{cls.registeredCount} / {cls.maxCapacity}</Table.Cell>
                    <Table.Cell>
                      <Flex gap={2}>
                        <Button size="xs" variant="outline" onClick={() => handleEdit(cls)}>ערוך</Button>
                        <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleDelete(cls.id)}>מחק</Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        <Dialog.Root open={showForm} onOpenChange={() => setShowForm(false)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="dark.card" borderColor="dark.border">
              <Dialog.CloseTrigger color="gray.400" />
              <Dialog.Header>
                <Dialog.Title color="brand.400">{editId ? 'עריכת חוג' : 'הוספת חוג חדש'}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleSubmit}>
                  <Flex direction="column" gap={4}>
                    <Field.Root required>
                      <Field.Label color="gray.300">שם חוג</Field.Label>
                      <Input name="name" value={form.name} onChange={handleChange} bg="dark.bg" color="white" borderColor="dark.border" />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label color="gray.300">תיאור</Field.Label>
                      <Input name="description" value={form.description} onChange={handleChange} bg="dark.bg" color="white" borderColor="dark.border" />
                    </Field.Root>
                    <SimpleGrid columns={2} gap={4}>
                      <Field.Root required>
                        <Field.Label color="gray.300">שעה התחלה</Field.Label>
                        <Input name="start_time" type="datetime-local" value={form.start_time} onChange={handleChange} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label color="gray.300">שעה סיום</Field.Label>
                        <Input name="end_time" type="datetime-local" value={form.end_time} onChange={handleChange} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                    </SimpleGrid>
                    <SimpleGrid columns={2} gap={4}>
                      <Field.Root required>
                        <Field.Label color="gray.300">חדר</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field name="room_id" value={form.room_id} onChange={handleChange} bg="dark.bg" color="white" borderColor="dark.border">
                            <option value="">בחר חדר</option>
                            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label color="gray.300">מאמן</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field name="trainer_id" value={form.trainer_id} onChange={handleChange} bg="dark.bg" color="white" borderColor="dark.border">
                            <option value="">בחר מאמן</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Field.Root>
                    </SimpleGrid>
                    <Field.Root required>
                      <Field.Label color="gray.300">מקסימום משתתפים</Field.Label>
                      <Input name="max_capacity" type="number" value={form.max_capacity} onChange={handleChange} min="1" bg="dark.bg" color="white" borderColor="dark.border" />
                    </Field.Root>

                    <Checkbox.Root
                      checked={form.is_active}
                      onCheckedChange={(e) => setForm(f => ({ ...f, is_active: e.checked }))}
                      colorPalette="brand"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label color="white">פעיל</Checkbox.Label>
                    </Checkbox.Root>

                    <Button type="submit" colorPalette="brand" w="full" mt={4}>{editId ? 'עדכן' : 'הוסף'}</Button>
                  </Flex>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Container>
    </Box>
  );
}
