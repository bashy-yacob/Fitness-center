import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import apiService from '../../api/apiService.js';
import SendPrivateMessageForm from '../all/SendPrivateMessageForm.jsx';

const TraineeMessagesPage = () => {
  const [privateMessages, setPrivateMessages] = useState([]);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [sentPrivateMessages, setSentPrivateMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('broadcast');
  const [sentFilter, setSentFilter] = useState('');
  const [sentSortAsc, setSentSortAsc] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const privateMsgs = await apiService.get('/trainee/messages/private');
        const broadcastMsgs = await apiService.get('/broadcast-messages');
        const sentMsgs = await apiService.get('/messages/sent-private');

        setPrivateMessages(privateMsgs);
        setBroadcastMessages(broadcastMsgs);
        setSentPrivateMessages(sentMsgs);
      } catch (err) {
        console.error('Error fetching trainee messages:', err);
        setError('שגיאה בטעינת הודעות');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredAndSortedSentMessages = useMemo(() => (
    sentPrivateMessages
      .filter((msg) => {
        const name = (msg.receiver_name || msg.receiver_email || '').toLowerCase();
        return name.includes(sentFilter.toLowerCase());
      })
      .sort((a, b) => {
        const aName = (a.receiver_name || a.receiver_email || '').toLowerCase();
        const bName = (b.receiver_name || b.receiver_email || '').toLowerCase();
        if (aName < bName) return sentSortAsc ? -1 : 1;
        if (aName > bName) return sentSortAsc ? 1 : -1;
        return 0;
      })
  ), [sentPrivateMessages, sentFilter, sentSortAsc]);

  const tabConfig = [
    { key: 'broadcast', label: 'הודעות כלליות' },
    { key: 'private', label: 'הודעות פרטיות' },
    { key: 'sent', label: 'הודעות שנשלחו' },
  ];

  return (
    <Container maxW="container.lg" py={10}>
      <Heading mb={6} color="brand.500">ההודעות שלי</Heading>

      <Stack direction={{ base: 'column', md: 'row' }} gap={3} mb={6}>
        {tabConfig.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            variant={selectedTab === tab.key ? 'solid' : 'outline'}
            colorPalette="brand"
          >
            {tab.label}
          </Button>
        ))}
      </Stack>

      <Card.Root bg="dark.card" borderColor="dark.border" borderWidth="1px">
        <Card.Body>
          <Box mb={6}>
            <SendPrivateMessageForm />
          </Box>

          {loading && (
            <Flex justify="center" py={8}>
              <Spinner size="lg" color="brand.400" />
            </Flex>
          )}

          {error && (
            <Alert.Root status="error" mb={4}>
              <Alert.Title>{error}</Alert.Title>
            </Alert.Root>
          )}

          {!loading && !error && privateMessages.length === 0 && broadcastMessages.length === 0 && (
            <Text>לא נמצאו הודעות.</Text>
          )}

          {selectedTab === 'broadcast' && !loading && (
            <Stack gap={4}>
              <Heading size="md" color="brand.400">הודעות כלליות</Heading>
              {broadcastMessages.map((msg, idx) => (
                <Card.Root key={msg.id || idx} bg="dark.bg" borderColor="dark.border" borderWidth="1px">
                  <Card.Body>
                    <Text fontWeight="bold" mb={1}>{msg.message_text.split('\n')[0]}</Text>
                    <Text color="gray.400" mb={1}>{msg.message_text.split('\n').slice(1).join(' ')}</Text>
                    <Text fontSize="sm" color="brand.400">
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}
                    </Text>
                  </Card.Body>
                </Card.Root>
              ))}
            </Stack>
          )}

          {selectedTab === 'private' && !loading && (
            <Stack gap={4}>
              <Heading size="md" color="brand.400">הודעות פרטיות</Heading>
              {privateMessages.map((msg, idx) => (
                <Card.Root key={msg.id || idx} bg="dark.bg" borderColor="dark.border" borderWidth="1px">
                  <Card.Body>
                    <Text fontWeight="bold" mb={1}>מאת: {msg.sender_name || msg.sender_email || 'משתמש'}</Text>
                    <Text color="gray.400" mb={1}>{msg.message_text}</Text>
                    <Text fontSize="sm" color="brand.400">
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}
                    </Text>
                  </Card.Body>
                </Card.Root>
              ))}
            </Stack>
          )}

          {selectedTab === 'sent' && !loading && (
            <Stack gap={4}>
              <Heading size="md" color="brand.400">הודעות פרטיות שנשלחו</Heading>

              <Flex gap={2} direction={{ base: 'column', md: 'row' }}>
                <Input
                  placeholder="סנן לפי שם/אימייל נמען..."
                  value={sentFilter}
                  onChange={(e) => setSentFilter(e.target.value)}
                  bg="dark.bg"
                  borderColor="dark.border"
                />
                <Button onClick={() => setSentSortAsc((v) => !v)} colorPalette="brand" variant="outline">
                  מיין לפי נמען {sentSortAsc ? '▲' : '▼'}
                </Button>
              </Flex>

              {filteredAndSortedSentMessages.map((msg, idx) => (
                <Card.Root key={msg.id || idx} bg="dark.bg" borderColor="dark.border" borderWidth="1px">
                  <Card.Body>
                    <Text fontWeight="bold" mb={1}>ל: {msg.receiver_name || msg.receiver_email || msg.receiver_id}</Text>
                    <Text color="gray.400" mb={1}>{msg.message_text}</Text>
                    <Text fontSize="sm" color="brand.400">
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}
                    </Text>
                  </Card.Body>
                </Card.Root>
              ))}
            </Stack>
          )}
        </Card.Body>
      </Card.Root>
    </Container>
  );
};

export default TraineeMessagesPage;
