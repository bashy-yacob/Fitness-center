import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, Flex, Input, Spinner } from '@chakra-ui/react';
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
        const privateMsgs = await apiService.get('/trainee/messages/private').catch(e => { console.error('שגיאה בהודעות פרטיות', e); throw e; });
        const broadcastMsgs = await apiService.get('/broadcast-messages').catch(e => { console.error('שגיאה בהודעות כלליות', e); throw e; });
        const sentMsgs = await apiService.get('/messages/sent-private').catch(e => { console.error('שגיאה בהודעות פרטיות שנשלחו', e); throw e; });
        setPrivateMessages(privateMsgs);
        setBroadcastMessages(broadcastMsgs);
        setSentPrivateMessages(sentMsgs);
      } catch (err) {
        setError('שגיאה בטעינת הודעות');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const tabs = [
    { key: 'broadcast', label: 'הודעות כלליות' },
    { key: 'private', label: 'הודעות פרטיות' },
    { key: 'sent', label: 'הודעות שנשלחו' },
  ];

  const MessageCard = ({ title, body, date }) => (
    <Box as="li" bg="dark.card" border="1.5px solid" borderColor="dark.border" borderRadius="18px" p={5} mb="18px" listStyleType="none">
      <Text fontWeight="bold" color="brand.400" mb={1}>{title}</Text>
      <Text color="gray.400" mb={1}>{body}</Text>
      <Text fontSize="xs" color="brand.400">{date ? new Date(date).toLocaleString('he-IL') : ''}</Text>
    </Box>
  );

  return (
    <Box bg="dark.card" borderRadius="18px" boxShadow="0 4px 32px #0005" p={{ base: 4, md: 8 }} maxW="900px" mx="auto" my="40px" border="1.5px solid" borderColor="dark.border">
      <Heading as="h2" size="lg" color="brand.500" mb={4}>ההודעות שלי</Heading>
      <Flex gap={4} mb={6} wrap="wrap">
        {tabs.map(tab => (
          <Button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            borderRadius="18px"
            variant={selectedTab === tab.key ? 'solid' : 'outline'}
            colorPalette="brand"
          >
            {tab.label}
          </Button>
        ))}
      </Flex>
      <Box bg="dark.section" borderRadius="14px" boxShadow="0 2px 12px #0003" p={5} border="1px solid" borderColor="dark.border">
        <Box my="24px">
          <SendPrivateMessageForm />
        </Box>
        {loading && <Flex justify="center" mt={10}><Spinner color="brand.500" /></Flex>}
        {error && <Text color="red.400">{error}</Text>}
        {!loading && !error && privateMessages.length === 0 && broadcastMessages.length === 0 && <Text color="gray.400">לא נמצאו הודעות.</Text>}

        {selectedTab === 'broadcast' && (
          <Box mb={8}>
            <Heading as="h3" size="md" color="brand.500" mb={4}>הודעות כלליות</Heading>
            <Box as="ul" p={0} m={0}>
              {broadcastMessages.map((msg, idx) => (
                <MessageCard
                  key={msg.id || idx}
                  title={msg.message_text.split('\n')[0]}
                  body={msg.message_text.split('\n').slice(1).join(' ')}
                  date={msg.sent_at}
                />
              ))}
            </Box>
          </Box>
        )}

        {selectedTab === 'private' && (
          <Box>
            <Heading as="h3" size="md" color="brand.500" mb={4}>הודעות פרטיות</Heading>
            <Box as="ul" p={0} m={0}>
              {privateMessages.map((msg, idx) => (
                <MessageCard
                  key={msg.id || idx}
                  title={`מאת: ${msg.sender_name || msg.sender_email || 'משתמש'}`}
                  body={msg.message_text}
                  date={msg.sent_at}
                />
              ))}
            </Box>
          </Box>
        )}

        {selectedTab === 'sent' && (
          <Box>
            <Heading as="h3" size="md" color="brand.500" mb={4}>הודעות פרטיות שנשלחו</Heading>
            <Flex gap={2} mb={3}>
              <Input
                placeholder="סנן לפי שם/אימייל נמען..."
                value={sentFilter}
                onChange={e => setSentFilter(e.target.value)}
                bg="dark.bg"
                color="white"
                borderColor="dark.border"
                flex={1}
              />
              <Button onClick={() => setSentSortAsc(v => !v)} colorPalette="secondary">
                מיין לפי נמען {sentSortAsc ? '▲' : '▼'}
              </Button>
            </Flex>
            <Box as="ul" p={0} m={0}>
              {sentPrivateMessages
                .filter(msg => {
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
                .map((msg, idx) => (
                  <MessageCard
                    key={msg.id || idx}
                    title={`ל: ${msg.receiver_name || msg.receiver_email || msg.receiver_id}`}
                    body={msg.message_text}
                    date={msg.sent_at}
                  />
                ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TraineeMessagesPage;
