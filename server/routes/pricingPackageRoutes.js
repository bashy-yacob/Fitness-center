import express from 'express';
import * as pricingPackageController from '../controllers/pricingPackageController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { validate, createPricingSchema, updatePricingSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', pricingPackageController.getAllPricingPackages);
router.get('/:id', pricingPackageController.getPricingPackageById);

// Admin only routes
router.post('/', verifyToken, isAdmin, validate(createPricingSchema), pricingPackageController.createPricingPackage);
router.put('/:id', verifyToken, isAdmin, validate(updatePricingSchema), pricingPackageController.updatePricingPackage);
router.delete('/:id', verifyToken, isAdmin, pricingPackageController.deletePricingPackage);

export default router;
