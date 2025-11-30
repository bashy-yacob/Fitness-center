import React, { useEffect, useState } from 'react';
import {
  fetchAllUsers,
  fetchUsersByType,
  createUser,
  updateUser,
  deleteUser
} from '../../api/userService';
import DataTable from '../../components/DataTable';
import { Box, Container, Heading, Button, Flex, Input, NativeSelect, Dialog, Field, SimpleGrid, Text } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'top',
  duration: 5000,
});

const USER_TYPES = [
  { value: '', label: 'הכל' },
  { value: 'trainee', label: 'מתאמן' },
  { value: 'trainer', label: 'מאמן' },
  { value: 'admin', label: 'מנהל' }
];

function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    user_type: '',
    password: '',
    date_of_birth: '',
    gender: '',
    specialization: ''
  });
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let data;
      if (filter) {
        data = await fetchUsersByType(filter);
      } else {
        data = await fetchAllUsers();
      }
      setUsers(data);
    } catch (e) {
      toaster.error({ title: 'שגיאה בטעינת משתמשים' });
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      user_type: user.user_type,
      password: '',
      date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
      gender: user.gender || '',
      specialization: user.specialization || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק משתמש זה?')) return;
    try {
      await deleteUser(id);
      toaster.success({ title: 'המשתמש נמחק בהצלחה' });
      loadUsers();
    } catch (err) {
      toaster.error({ title: 'שגיאה במחיקת המשתמש' });
    }
  };

  const handleAdd = () => {
    setEditUser(null);
    setForm({ first_name: '', last_name: '', email: '', phone_number: '', user_type: '', password: '', date_of_birth: '', gender: '', specialization: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = [];
    if (!form.first_name) errors.push('שם פרטי הוא שדה חובה.');
    if (!form.last_name) errors.push('שם משפחה הוא שדה חובה.');
    if (!form.email) errors.push('אימייל הוא שדה חובה.');
    if (!form.phone_number.match(/^\d{10}$/)) errors.push('פורמט מספר טלפון אינו תקין (10 ספרות בלבד).');
    if (!form.user_type) errors.push('סוג משתמש הוא שדה חובה.');
    if (!editUser && !form.password) errors.push('סיסמה היא שדה חובה.');
    if (form.user_type === 'trainee') {
      if (!form.date_of_birth.match(/^\d{4}-\d{2}-\d{2}$/)) errors.push('פורמט תאריך לידה חייב להיות YYYY-MM-DD.');
      if (!form.gender) errors.push('מין לא יכול להיות ריק.');
      if (!['male', 'female', 'other'].includes(form.gender)) errors.push('מין חייב להיות "male", "female" או "other".');
    }
    if (form.user_type === 'trainer') {
      if (!form.specialization) errors.push('התמחות היא שדה חובה עבור מאמן.');
    }
    setFormErrors(errors);
    if (errors.length) return;
    try {
      if (editUser) {
        await updateUser(editUser.id, form);
        toaster.success({ title: 'המשתמש עודכן בהצלחה' });
      } else {
        const userData = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          user_type: form.user_type,
          password: form.password,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
          specialization: form.user_type === 'trainer' ? form.specialization : undefined
        };
        Object.keys(userData).forEach(key => (userData[key] === '' || userData[key] === undefined) && delete userData[key]);
        await createUser(userData);
        toaster.success({ title: 'המשתמש נוצר בהצלחה' });
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      setFormErrors([err?.response?.data?.message || 'שגיאה בשמירה']);
    }
  };

  const columns = [
    { key: 'name', label: 'שם' },
    { key: 'email', label: 'אימייל' },
    { key: 'phone', label: 'טלפון' },
    { key: 'user_type', label: 'סוג משתמש' },
    { key: 'actions', label: 'פעולות' },
  ];

  const data = (Array.isArray(users) ? users : []).map(user => ({
    name: user.first_name + ' ' + user.last_name,
    email: user.email,
    phone: user.phone_number,
    user_type: user.user_type,
    actions: (
      <Flex gap={2}>
        <Button size="xs" variant="outline" onClick={() => handleEdit(user)}>ערוך</Button>
        <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleDelete(user.id)}>מחק</Button>
      </Flex>
    )
  }));

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading mb={8} color="brand.500">ניהול משתמשים</Heading>

        <Flex justify="space-between" mb={6}>
          <Box w="200px">
            <NativeSelect.Root>
              <NativeSelect.Field value={filter} onChange={e => setFilter(e.target.value)} bg="dark.bg" color="white" borderColor="dark.border">
                {USER_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>
          <Button onClick={handleAdd} colorPalette="brand">הוסף משתמש חדש</Button>
        </Flex>

        {loading ? (
          <Text color="white">טוען...</Text>
        ) : (
          <DataTable columns={columns} data={data} />
        )}

        <Dialog.Root open={showModal} onOpenChange={() => setShowModal(false)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="dark.card" borderColor="dark.border">
              <Dialog.CloseTrigger color="gray.400" />
              <Dialog.Header>
                <Dialog.Title color="brand.400">{editUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleSubmit}>
                  <Flex direction="column" gap={4}>
                    {formErrors.length > 0 && (
                      <Box color="red.500">
                        {formErrors.map((err, i) => <Text key={i}>{err}</Text>)}
                      </Box>
                    )}
                    <SimpleGrid columns={2} gap={4}>
                      <Field.Root required>
                        <Field.Label color="gray.300">שם פרטי</Field.Label>
                        <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label color="gray.300">שם משפחה</Field.Label>
                        <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                    </SimpleGrid>

                    <Field.Root required>
                      <Field.Label color="gray.300">אימייל</Field.Label>
                      <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border" />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label color="gray.300">טלפון</Field.Label>
                      <Input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border" />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label color="gray.300">סוג משתמש</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={form.user_type} onChange={e => setForm(f => ({ ...f, user_type: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border">
                          <option value="">בחר סוג</option>
                          <option value="trainee">מתאמן</option>
                          <option value="trainer">מאמן</option>
                          <option value="admin">מנהל</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Field.Root>

                    {form.user_type === 'trainee' && (
                      <>
                        <Field.Root required>
                          <Field.Label color="gray.300">תאריך לידה</Field.Label>
                          <Input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border" />
                        </Field.Root>
                        <Field.Root required>
                          <Field.Label color="gray.300">מין</Field.Label>
                          <NativeSelect.Root>
                            <NativeSelect.Field value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border">
                              <option value="">בחר מין</option>
                              <option value="male">זכר</option>
                              <option value="female">נקבה</option>
                              <option value="other">אחר</option>
                            </NativeSelect.Field>
                          </NativeSelect.Root>
                        </Field.Root>
                      </>
                    )}

                    {form.user_type === 'trainer' && (
                      <Field.Root required>
                        <Field.Label color="gray.300">התמחות</Field.Label>
                        <Input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border" />
                      </Field.Root>
                    )}

                    {!editUser && (
                      <Field.Root required>
                        <Field.Label color="gray.300">סיסמה</Field.Label>
                        <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} bg="dark.bg" color="white" borderColor="dark.border" autoComplete="new-password" />
                      </Field.Root>
                    )}

                    <Button type="submit" colorPalette="brand" w="full" mt={4}>שמור</Button>
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

export default UsersAdminPage;
