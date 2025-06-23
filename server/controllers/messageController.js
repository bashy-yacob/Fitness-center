import messageService from '../services/messageService.js';

const messageController = {
    // שליחת הודעה שיווקית
    async broadcastMessage(req, res) {
        
        try {
            const { subject, text } = req.body;
            if (!subject || !text) {
                return res.status(400).json({ message: 'Subject and text are required.' });
            }
            // נניח ש-id של המנהל מגיע מה-token
            const senderId = req.user?.id || null;
            await messageService.sendBroadcastMessage(senderId, subject, text);
            res.status(201).json({ message: 'Broadcast message sent successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to send broadcast message.', error });
        }
    },

    // קבלת כל ההודעות שנשלחו
    async getSentMessages(req, res) {
        try {
            const messages = await messageService.fetchSentMessages();
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch sent messages.', error });
        }
    },

    // עריכת הודעה שיווקית
    async updateBroadcastMessage(req, res) {
        try {
            const { id } = req.params;
            const { subject, text } = req.body;
            await messageService.updateBroadcastMessage(id, subject, text);
            res.json({ message: 'Broadcast message updated successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update broadcast message.', error });
        }
    },

    // מחיקת הודעה שיווקית
    async deleteBroadcastMessage(req, res) {
        try {
            const { id } = req.params;
            await messageService.deleteBroadcastMessage(id);
            res.json({ message: 'Broadcast message deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete broadcast message.', error });
        }
    },

    // שליפת הודעות פרטיות למתאמן
    async getPrivateMessagesForTrainee(req, res) {
        try {
            const traineeId = req.user.id;
            const messages = await messageService.fetchPrivateMessages(traineeId);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch private messages.', error });
        }
    },

    // שליחת הודעה פרטית למתאמן
    async sendPrivateMessageToTrainee(req, res) {
        try {
            const senderId = req.user?.id || null;
            const { receiver_id, content } = req.body;
            if (!receiver_id || !content) {
                return res.status(400).json({ message: 'נדרש לבחור מתאמן ולהזין תוכן הודעה.' });
            }
            await messageService.sendPrivateMessage(senderId, receiver_id, content);
            res.status(201).json({ message: 'הודעה פרטית נשלחה בהצלחה.' });
        } catch (error) {
            res.status(500).json({ message: 'שליחת הודעה פרטית נכשלה.', error });
        }
    },

    // שליחת הודעה פרטית לכל משתמש (מתאמן, מאמן, מנהל)
    async sendPrivateMessageToAnyUser(req, res) {
        try {
            const senderId = req.user?.id || null;
            const { receiver_id, content } = req.body;
            if (!receiver_id || !content) {
                return res.status(400).json({ message: 'נדרש לבחור נמען ולהזין תוכן הודעה.' });
            }
            await messageService.sendPrivateMessage(senderId, receiver_id, content);
            res.status(201).json({ message: 'הודעה פרטית נשלחה בהצלחה.' });
        } catch (error) {
            res.status(500).json({ message: 'שליחת הודעה פרטית נכשלה.', error });
        }
    },

    // הודעות פרטיות שהתקבלו ע"י משתמש מחובר (כולל שם השולח)
    async getReceivedPrivateMessages(req, res) {
        try {
            const userId = req.user?.id;
            const messages = await messageService.fetchPrivateMessagesWithSender(userId);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: 'שגיאה בשליפת הודעות פרטיות שהתקבלו.', error });
        }
    },

    // הודעות פרטיות שנשלחו ע"י המשתמש המחובר (כולל שם הנמען)
    async getSentPrivateMessages(req, res) {
        try {
            const senderId = req.user?.id;
            const messages = await messageService.fetchSentPrivateMessagesWithReceiverName(senderId);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: 'שגיאה בשליפת הודעות פרטיות שנשלחו.', error });
        }
    }
};

export default messageController;
