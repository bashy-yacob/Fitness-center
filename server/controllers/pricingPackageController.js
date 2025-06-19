import { pricingPackageService } from '../services/pricingPackageService.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Get all active pricing packages
 */
export async function getAllPricingPackages(req, res, next) {
    try {
        const packages = await pricingPackageService.getAllPricingPackages();
        res.status(200).json(packages);
    } catch (error) {
        next(error);
    }
}

/**
 * Get a specific pricing package by ID
 */
export async function getPricingPackageById(req, res, next) {
    try {
        const { id } = req.params;        const pricingPackage = await pricingPackageService.getPricingPackageById(id);
        if (!pricingPackage) {
            throw new AppError('Pricing package not found', 404);
        }
        res.status(200).json(pricingPackage);
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new pricing package (Admin only)
 */
export async function createPricingPackage(req, res, next) {
    try {
        const result = await pricingPackageService.createPricingPackage(req.body);
        res.status(201).json({
            message: 'Pricing package created successfully',
            id: result.id
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update an existing pricing package (Admin only)
 */
export async function updatePricingPackage(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await pricingPackageService.updatePricingPackage(id, req.body);
        if (!updated) {
            throw new AppError('Failed to update pricing package or package not found', 400);
        }
        res.status(200).json({ message: 'Pricing package updated successfully' });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a pricing package (Admin only)
 */
export async function deletePricingPackage(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await pricingPackageService.deletePricingPackage(id);
        if (!deleted) {
            throw new AppError('Failed to delete pricing package or package not found', 400);
        }
        res.status(200).json({ message: 'Pricing package deleted successfully' });
    } catch (error) {
        next(error);
    }
}
