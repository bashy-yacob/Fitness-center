import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import apiService from '../../api/apiService';
import './MessagesPage.css';

// --- הדמיה ---
const useAuth = () => ({ user: { id: '123' } });
const apiService = {
  get: async (url) => {
    await new Promise(res => setTimeout(res, 700));
    if (url.includes('/messages/inbox')) {
      return [
        { id: 1, from: 'הנהלת המכון', subject: 'עדכון מערכת שעות', date: new Date().toISOString(), text: '...' },
        { id: 2, from: 'דנה כהן (מאמנת)', subject: 'לגבי תוכנית האימון שלך', date: new Date(Date.now() - 86400000).toISOString(), text: '...' }
      ];
    }
    if (url.includes('/trainers')) {
      return [
        { id: 'trainer-1', name: 'דנה כהן' },
        { id: 'trainer-2', name: 'יעל לוי' },
        { id: 'admin-1', name: 'הנהלת המכון' }
      ];
    }
    return [];
  },
  post: async (url, data) => {
    console.log('Sending message:', url, data);
    await new Promise(res => setTimeout(res, 1500));
    return { success: true };
  }
};


function MessagesPage() {
    const [messages, setMessages] = useState([]);
    const [trainers, setTrainers] = useState([]); // State חדש לרשימת הנמענים
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState(''); // State לנמען שנבחר
    
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [messagesResponse, trainersResponse] = await Promise.all([
                    apiService.get(`/messages/inbox/${user.id}`),
                    apiService.get('/trainers') // קריאה חדשה לאכלוס הנמענים
                ]);
                setMessages(messagesResponse);
                setTrainers(trainersResponse);
                if (trainersResponse.length > 0) {
                    setRecipient(trainersResponse[0].id); // בחירת ברירת מחדל
                }
            } catch (err) {
                setError('טעינת ההודעות נכשלה.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !recipient) {
            setError('יש למלא את תוכן ההודעה ולבחור נמען.');
            return;
        }

        setIsSending(true);
        setError('');
        setSuccessMessage('');

        try {
            await apiService.post('/messages/send', { 
                recipientId: recipient, 
                messageText: newMessage,
                // השרת ידע מי השולח לפי הטוקן
            });
            setSuccessMessage('ההודעה נשלחה בהצלחה!');
            setNewMessage(''); // איפוס הטופס
        } catch (err) {
            setError('שליחת ההודעה נכשלה.');
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return <p className="loading-message">טוען הודעות...</p>;
    
    return (
        <div className="messages-page-container">
            <h1>הודעות</h1>
            <div className="messages-layout">
                <div className="inbox-panel card">
                    <h2>תיבת דואר נכנס</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="messages-list">
                        {messages.length > 0 ? messages.map(msg => (
                            <div key={msg.id} className="message-item">
                                <p className="message-from"><strong>מאת:</strong> {msg.from}</p>
                                <p className="message-subject">{msg.subject}</p>
                                <p className="message-date">{new Date(msg.date).toLocaleString('he-IL')}</p>
                            </div>
                        )) : <p>אין הודעות חדשות.</p>}
                    </div>
                </div>

                <div className="send-panel card">
                    <h2>שליחת הודעה חדשה</h2>
                    <form onSubmit={handleSend} className="send-form">
                        <div className="form-group">
                            <label htmlFor="recipient">אל:</label>
                            <select id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                                {trainers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="message-content">תוכן ההודעה:</label>
                            <textarea
                                id="message-content"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="כתוב/י את הודעתך כאן..."
                                rows="6"
                            />
                        </div>
                        {successMessage && <p className="success-message">{successMessage}</p>}
                        <button type="submit" className="submit-btn" disabled={isSending}>
                            {isSending ? 'שולח...' : 'שלח הודעה'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MessagesPage;