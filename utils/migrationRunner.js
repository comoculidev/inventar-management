const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function runMigrations() {
    console.log('Starting migrations...');
    
    try {
        // Create migrations tracking table
        await query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Get list of already executed migrations
        const executedMigrations = await query('SELECT filename FROM migrations');
        const executedFiles = executedMigrations.rows.map(row => row.filename);
        
        // Get all migration files
        const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        // Run pending migrations
        for (const file of migrationFiles) {
            if (!executedFiles.includes(file)) {
                console.log(`Running migration: ${file}`);
                const migrationPath = path.join(MIGRATIONS_DIR, file);
                const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
                
                await query('BEGIN');
                try {
                    await query(migrationSQL);
                    await query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
                    await query('COMMIT');
                    console.log(`Migration ${file} completed successfully`);
                } catch (error) {
                    await query('ROLLBACK');
                    console.error(`Migration ${file} failed:`, error.message);
                    throw error;
                }
            } else {
                console.log(`Migration ${file} already executed, skipping...`);
            }
        }
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

module.exports = { runMigrations };
