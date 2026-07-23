const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seedAdminUser() {
    try {
        // Check if admin user already exists
        const checkResult = await query('SELECT id FROM users WHERE username = $1', ['admin']);
        
        if (checkResult.rows.length > 0) {
            console.log('Admin user already exists');
            return;
        }
        
        // Hash password
        const password = 'admin123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create admin user
        const id = uuidv4();
        const result = await query(
            'INSERT INTO users (id, username, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [id, 'admin', hashedPassword, 'admin']
        );
        
        console.log('Admin user created successfully:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Role: admin');
        console.log('Please change the password after first login!');
        
        return result.rows[0];
    } catch (error) {
        console.error('Error seeding admin user:', error);
        throw error;
    }
}

// Also create a test user
async function seedTestUser() {
    try {
        // Check if test user already exists
        const checkResult = await query('SELECT id FROM users WHERE username = $1', ['user']);
        
        if (checkResult.rows.length > 0) {
            console.log('Test user already exists');
            return;
        }
        
        // Hash password
        const password = 'user123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create test user
        const id = uuidv4();
        const result = await query(
            'INSERT INTO users (id, username, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [id, 'user', hashedPassword, 'user']
        );
        
        console.log('Test user created successfully:');
        console.log('Username: user');
        console.log('Password: user123');
        console.log('Role: user');
        
        return result.rows[0];
    } catch (error) {
        console.error('Error seeding test user:', error);
        throw error;
    }
}

async function seedUsers() {
    try {
        console.log('Seeding users...');
        await seedAdminUser();
        await seedTestUser();
        console.log('User seeding completed!');
    } catch (error) {
        console.error('Error during user seeding:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    seedUsers();
}

module.exports = { seedAdminUser, seedTestUser, seedUsers };
