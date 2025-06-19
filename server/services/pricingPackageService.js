import pool from '../config/db.js';

/**
 * Service for managing pricing packages (subscriptions)
 */
export class PricingPackageService {
    /**
     * Get all active pricing packages
     */    async getAllPricingPackages() {
        const connection = await pool.getConnection();
        try {
            const [packages] = await connection.execute(
                `SELECT id, name, description, price, duration_days, max_classes_per_month 
                FROM subscriptions 
                WHERE is_active = TRUE
                ORDER BY price ASC`
            );
            
            // המרת המידע לפורמט שהפרונט מצפה לו
            return packages.map(pkg => ({
                id: pkg.id,
                name: pkg.name,
                price: pkg.price,
                recommended: pkg.price === 299, // הפרימיום מומלץ
                features: pkg.description.split(',').map(feature => feature.trim()) // מפצל את התיאור לתכונות נפרדות
            }));
        } catch (error) {
            throw new Error(`Failed to get pricing packages: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    /**
     * Get a specific pricing package by ID
     */
    async getPricingPackageById(id) {
        const connection = await pool.getConnection();
        try {
            const [packages] = await connection.execute(
                `SELECT id, name, description, price, duration_days, max_classes_per_month 
                FROM subscriptions 
                WHERE id = ? AND is_active = TRUE`,
                [id]
            );
            return packages[0] || null;
        } catch (error) {
            throw new Error(`Failed to get pricing package: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    /**
     * Create a new pricing package
     */
    async createPricingPackage(packageData) {
        const connection = await pool.getConnection();
        try {
            const { name, description, price, duration_days, max_classes_per_month } = packageData;
            const [result] = await connection.execute(
                `INSERT INTO subscriptions (name, description, price, duration_days, max_classes_per_month)
                VALUES (?, ?, ?, ?, ?)`,
                [name, description, price, duration_days, max_classes_per_month]
            );
            return { id: result.insertId };
        } catch (error) {
            throw new Error(`Failed to create pricing package: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    /**
     * Update an existing pricing package
     */
    async updatePricingPackage(id, packageData) {
        const connection = await pool.getConnection();
        try {
            const { name, description, price, duration_days, max_classes_per_month } = packageData;
            const [result] = await connection.execute(
                `UPDATE subscriptions 
                SET name = ?, description = ?, price = ?, duration_days = ?, max_classes_per_month = ?
                WHERE id = ?`,
                [name, description, price, duration_days, max_classes_per_month, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Failed to update pricing package: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    /**
     * Delete a pricing package (soft delete by setting is_active to false)
     */
    async deletePricingPackage(id) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                'UPDATE subscriptions SET is_active = FALSE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Failed to delete pricing package: ${error.message}`);
        } finally {
            connection.release();
        }
    }
}

export const pricingPackageService = new PricingPackageService();
