// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import classRoutes from './routes/classRoutes.js';
import roomRoutes from './routes/roomRoutes.js'; // וודא שאתה מייבא אותו
import subscriptionRoutes from './routes/subscriptionRoutes.js'; // ייבוא subscriptionRoutes (נבנה בהמשך)
import paymentRoutes from './routes/paymentRoutes.js'; // ייבוא paymentRoutes (נבנה בהמשך)
import traineeRoutes from './routes/traineeRoutes.js';  // הוספת ייבוא של נתיבי מתאמן
import pricingPackageRoutes from './routes/pricingPackageRoutes.js';
import pool from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // זה יאפשר גישה מכל מקור, טוב לפיתוח

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Welcome to the GymFlow API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/trainees', traineeRoutes);  // הוספת הנתיב למתאמנים
app.use('/api/rooms', roomRoutes); // הוספת roomRoutes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pricing-packages', pricingPackageRoutes);


app.use(errorHandler);

pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully.');
        connection.release();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    });