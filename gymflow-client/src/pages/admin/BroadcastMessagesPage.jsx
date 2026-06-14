import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, Flex, Spinner } from '@chakra-ui/react';
import BroadcastMessageForm from './BroadcastMessageForm.jsx';
import EditBroadcastMessageModal from './EditBroadcastMessageModal.jsx';
import PrivateMessageForm from '../PrivateMessageForm.jsx';
import apiService from '../../api/apiService.js';

const BroadcastMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editText, setEditText] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.get('/broadcast-messages');
      setMessages(data);
    } catch (err) {
      setError('שגיאה בטעינת הודעות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async (subject, text) => {
    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      await apiService.post('/broadcast-messages', { subject, text });
      setSuccess('ההודעה נשלחה בהצלחה!');
      await fetchMessages();
    } catch (err) {
      setError('שליחת ההודעה נכשלה');
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (msg) => {
    const [subject, ...textArr] = msg.message_text.split('\n');
    setEditId(msg.id);
    setEditSubject(subject);
    setEditText(textArr.join(' '));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק הודעה זו?')) return;
    setEditLoading(true);
    try {
      await apiService.delete(`/broadcast-messages/${id}`);
      await fetchMessages();
    } catch {
      alert('שגיאה במחיקה');
    }
    setEditLoading(false);
  };

  const handleSaveEdit = async (subject, text) => {
    setEditLoading(true);
    try {
      await apiService.put(`/broadcast-messages/${editId}`, { subject, text });
      setEditId(null);
      await fetchMessages();
    } catch {
      alert('שגיאה בעדכון');
    }
    setEditLoading(false);
  };

  return (
    <Box maxW="600px" mx="auto" my="40px" p={6} bg="dark.card" borderRadius="18px" border="1.5px solid" borderColor="dark.border" boxShadow="0 4px 32px #0005">
      <Heading as="h2" size="lg" textAlign="center" color="brand.500" mb={4}>הודעות שיווקיות שנשלחו</Heading>
      <BroadcastMessageForm onSend={handleSend} loading={sending} />
      <Box my="32px">
        <PrivateMessageForm />
      </Box>
      {success && <Text color="brand.500" mb={3}>{success}</Text>}
      {loading && <Flex justify="center" py={4}><Spinner color="brand.500" /></Flex>}
      {error && <Text color="red.400">{error}</Text>}
      {!loading && !error && messages.length === 0 && <Text color="gray.400">לא נמצאו הודעות.</Text>}
      <Box as="ul" listStyleType="none" p={0}>
        {messages.map((msg, idx) => (
          <Box as="li" key={msg.id || idx} borderBottom="1px solid" borderColor="dark.border" mb={4} pb={3} position="relative">
            <Text fontWeight="bold" mb={1} color="white">
              {msg.message_text.split('\n')[0]}
            </Text>
            <Text color="gray.400" mb={1}>
              {msg.message_text.split('\n').slice(1).join(' ')}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {msg.sent_at ? new Date(msg.sent_at).toLocaleString('he-IL') : ''}
            </Text>
            <Flex position="absolute" left={2} top={2} gap={2}>
              <Button size="xs" colorPalette="yellow" onClick={() => handleEdit(msg)}>ערוך</Button>
              <Button size="xs" colorPalette="red" onClick={() => handleDelete(msg.id)} disabled={editLoading}>מחק</Button>
            </Flex>
          </Box>
        ))}
      </Box>
      <EditBroadcastMessageModal
        open={!!editId}
        onClose={() => setEditId(null)}
        onSave={handleSaveEdit}
        initialSubject={editSubject}
        initialText={editText}
      />
    </Box>
  );
};

export default BroadcastMessagesPage;
