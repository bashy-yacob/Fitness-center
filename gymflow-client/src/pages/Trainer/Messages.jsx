import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { classService } from '../../api/classService';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Heading, Button, Flex, Table, Input, Textarea, Text, Tabs, Badge, Checkbox, NativeSelect, Spinner, Card } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'top',
  duration: 5000,
});

export default function TrainerMessagesPage() {
  const [trainees, setTrainees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const trainerId = user?.id;

  useEffect(() => {
    if (!trainerId) return;
    setLoadingData(true);
    Promise.all([
      apiService.get(`/trainer/${trainerId}/trainees`).catch(() => []),
      classService.getTrainerClasses(trainerId).catch(() => []),
      apiService.get(`/trainer/${trainerId}/messages/sent`).catch(() => []),
      apiService.get(`/users/me/messages/received`).catch(() => []),
      apiService.get('/broadcast-messages').catch(() => [])
    ]).then(([trainees, classes, sent, received, broadcast]) => {
      setTrainees(trainees);
      setClasses(classes);
      setSentMessages(sent);
      setReceivedMessages(received);
      setBroadcastMessages(broadcast);
    }).catch(() => toaster.error({ title: 'שגיאה בטעינת נתונים' }))
      .finally(() => setLoadingData(false));
  }, [trainerId]);

  const handleSelectTrainee = (id) => {
    setSelectedTrainees((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handleSend = async (sendType) => {
    if (!messageText) return;
    setLoading(true);
    try {
      if (sendType === 'private') {
        if (selectedTrainees.length === 0) return;
        await apiService.post(`/trainer/${trainerId}/messages/send-batch`, {
          traineeIds: selectedTrainees,
          messageText,
        });
      } else if (sendType === 'class') {
        if (!selectedClass) return;
        await apiService.post(`/trainer/${trainerId}/messages/send-class`, {
          classId: selectedClass,
          messageText,
        });
      }
      setMessageText('');
      setSelectedTrainees([]);
      setSelectedClass('');
      toaster.success({ title: 'ההודעה נשלחה בהצלחה!' });
      const msgs = await apiService.get(`/trainer/${trainerId}/messages/sent`).catch(() => []);
      setSentMessages(msgs);
    } catch {
      toaster.error({ title: 'שגיאה בשליחת הודעה' });
    }
    setLoading(false);
  };

  const privateInbox = receivedMessages.filter(m => m.message_type === 'private');
  const filteredTrainees = trainees.filter(t =>
    (t.first_name + ' ' + t.last_name + ' ' + t.email).toLowerCase().includes(search.toLowerCase())
  );

  if (!trainerId) {
    return (
      <Flex justify="center" mt={10}>
        <Text color="red.500">יש להתחבר כמאמן כדי לצפות בעמוד זה.</Text>
      </Flex>
    );
  }

  if (loadingData) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" />
        <Text ml={4} color="white">טוען נתונים...</Text>
      </Flex>
    );
  }

  return (
    <Box bg="dark.bg" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading mb={8} color="brand.500">הודעות מאמן</Heading>

        <Tabs.Root defaultValue="inbox" variant="enclosed">
          <Tabs.List bg="dark.card" borderColor="dark.border">
            <Tabs.Trigger value="inbox" _selected={{ color: 'brand.400', borderColor: 'brand.400' }}>הודעות שהתקבלו</Tabs.Trigger>
            <Tabs.Trigger value="send" _selected={{ color: 'brand.400', borderColor: 'brand.400' }}>שליחת הודעה</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="inbox" p={4} bg="dark.card" borderBottomRadius="md" borderWidth="1px" borderTopWidth="0" borderColor="dark.border">
            <Tabs.Root defaultValue="private" variant="subtle">
              <Tabs.List mb={4}>
                <Tabs.Trigger value="private">הודעות פרטיות</Tabs.Trigger>
                <Tabs.Trigger value="general">הודעות כלליות</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="private">
                {privateInbox.length === 0 ? (
                  <Text color="gray.500" textAlign="center">לא נמצאו הודעות.</Text>
                ) : (
                  <Table.Root variant="outline">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader color="brand.400">שולח</Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.400">תוכן</Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.400">נשלח בתאריך</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {privateInbox.map((msg) => (
                        <Table.Row key={msg.id}>
                          <Table.Cell color="white">{msg.sender_name || msg.sender_email || msg.sender_id}</Table.Cell>
                          <Table.Cell color="white">{msg.message_text}</Table.Cell>
                          <Table.Cell color="white">{new Date(msg.sent_at).toLocaleString('he-IL')}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                )}
              </Tabs.Content>

              <Tabs.Content value="general">
                {broadcastMessages.length === 0 ? (
                  <Text color="gray.500" textAlign="center">לא נמצאו הודעות כלליות.</Text>
                ) : (
                  <Table.Root variant="outline">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader color="brand.400">נושא</Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.400">תוכן</Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.400">נשלח בתאריך</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {broadcastMessages.map((msg) => {
                        const subject = msg.message_text.split('\n')[0];
                        const content = msg.message_text.split('\n').slice(1).join(' ').trim();
                        return (
                          <Table.Row key={msg.id}>
                            <Table.Cell color="white">{subject}</Table.Cell>
                            <Table.Cell color="white">{content}</Table.Cell>
                            <Table.Cell color="white">{msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}</Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                )}
              </Tabs.Content>
            </Tabs.Root>
          </Tabs.Content>

          <Tabs.Content value="send" p={4} bg="dark.card" borderBottomRadius="md" borderWidth="1px" borderTopWidth="0" borderColor="dark.border">
            <Tabs.Root defaultValue="private" variant="subtle">
              <Tabs.List mb={4}>
                <Tabs.Trigger value="private">הודעה פרטית</Tabs.Trigger>
                <Tabs.Trigger value="class">הודעה לחוג</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="private">
                <Heading size="sm" mb={2} color="brand.400">בחר מתאמנים:</Heading>
                <Input
                  placeholder="חפש מתאמן..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  mb={4}
                  bg="dark.bg"
                  color="white"
                  borderColor="dark.border"
                />

                <Box maxH="260px" overflowY="auto" bg="dark.bg" p={4} borderRadius="md" borderWidth="1px" borderColor="dark.border" mb={4}>
                  {filteredTrainees.length === 0 ? (
                    <Text color="gray.500">לא נמצאו מתאמנים.</Text>
                  ) : (
                    <Flex direction="column" gap={2}>
                      {filteredTrainees.map((t) => (
                        <Checkbox.Root
                          key={t.id}
                          checked={selectedTrainees.includes(t.id)}
                          onCheckedChange={() => handleSelectTrainee(t.id)}
                          colorPalette="brand"
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label color="white">
                            {t.first_name} {t.last_name} <Text as="span" color="gray.500" fontSize="sm">({t.email})</Text>
                          </Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                    </Flex>
                  )}
                </Box>

                <Textarea
                  placeholder="הקלד כאן את תוכן ההודעה..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  rows={4}
                  mb={4}
                  bg="dark.bg"
                  color="white"
                  borderColor="dark.border"
                />

                <Button
                  onClick={() => handleSend('private')}
                  loading={loading}
                  disabled={!messageText || selectedTrainees.length === 0}
                  colorPalette="brand"
                >
                  שלח הודעה
                </Button>
              </Tabs.Content>

              <Tabs.Content value="class">
                <Heading size="sm" mb={2} color="brand.400">בחר חוג:</Heading>
                <NativeSelect.Root mb={4}>
                  <NativeSelect.Field
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    bg="dark.bg"
                    color="white"
                    borderColor="dark.border"
                  >
                    <option value="">בחר חוג</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({new Date(cls.start_time || cls.startTime).toLocaleString('he-IL')})
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>

                <Textarea
                  placeholder="הקלד כאן את תוכן ההודעה..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  rows={4}
                  mb={4}
                  bg="dark.bg"
                  color="white"
                  borderColor="dark.border"
                />

                <Button
                  onClick={() => handleSend('class')}
                  loading={loading}
                  disabled={!messageText || !selectedClass}
                  colorPalette="brand"
                >
                  שלח הודעה
                </Button>
              </Tabs.Content>
            </Tabs.Root>

            <Box mt={8}>
              <Heading size="sm" mb={4} color="brand.400">הודעות שנשלחו</Heading>
              {sentMessages.length === 0 ? (
                <Text color="gray.500" textAlign="center">לא נשלחו הודעות.</Text>
              ) : (
                <Table.Root variant="outline">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader color="brand.400">נמען</Table.ColumnHeader>
                      <Table.ColumnHeader color="brand.400">אימייל</Table.ColumnHeader>
                      <Table.ColumnHeader color="brand.400">תוכן</Table.ColumnHeader>
                      <Table.ColumnHeader color="brand.400">נשלח בתאריך</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {sentMessages.map((msg) => (
                      <Table.Row key={msg.id}>
                        <Table.Cell color="white">{msg.first_name} {msg.last_name}</Table.Cell>
                        <Table.Cell color="white">{msg.email}</Table.Cell>
                        <Table.Cell color="white">{msg.message_text}</Table.Cell>
                        <Table.Cell color="white">{new Date(msg.sent_at).toLocaleString('he-IL')}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              )}
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </Box>
  );
}
