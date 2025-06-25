import pool from '../config/db.js';
import BaseService from './BaseService.js';

// שירות CRUD גנרי לטבלת subscriptions (חבילות מחיר)
const pricingPackageService = new BaseService('subscriptions', pool);

export default pricingPackageService;
