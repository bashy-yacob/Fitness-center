// utils/authUtils.js
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // מספר סבבי גיבוב - ככל שיותר גבוה, בטוח יותר אך איטי יותר

export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};