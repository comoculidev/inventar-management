const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// Parse Excel file and extract inventory items
function parseExcelFile(filePath) {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    const items = [];
    
    for (const row of jsonData) {
        // Map Excel columns to our database fields
        // Expected columns: inventory_number, location, status, responsible_person, category, room_id
        const item = {
            id: uuidv4(),
            inventory_number: row['İnventar Nömrəsi'] || row['inventory_number'] || row['Inventory Number'] || '',
            location: row['Yerləşməsi'] || row['location'] || row['Location'] || '',
            status: row['Status'] || row['status'] || row['Status'] || '',
            responsible_person: row['Məsul Şəxs'] || row['responsible_person'] || row['Responsible Person'] || '',
            category: row['Kateqoriya'] || row['category'] || row['Category'] || '',
            room_id: row['Otaq ID'] || row['room_id'] || row['Room ID'] || ''
        };
        
        // Only add if inventory_number exists
        if (item.inventory_number) {
            items.push(item);
        }
    }
    
    return items;
}

// Parse Excel file from buffer
function parseExcelBuffer(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    const items = [];
    
    for (const row of jsonData) {
        const item = {
            id: uuidv4(),
            inventory_number: row['İnventar Nömrəsi'] || row['inventory_number'] || row['Inventory Number'] || '',
            location: row['Yerləşməsi'] || row['location'] || row['Location'] || '',
            status: row['Status'] || row['status'] || row['Status'] || '',
            responsible_person: row['Məsul Şəxs'] || row['responsible_person'] || row['Responsible Person'] || '',
            category: row['Kateqoriya'] || row['category'] || row['Category'] || '',
            room_id: row['Otaq ID'] || row['room_id'] || row['Room ID'] || ''
        };
        
        if (item.inventory_number) {
            items.push(item);
        }
    }
    
    return items;
}

// Validate items before import
function validateItems(items) {
    const validItems = [];
    const invalidItems = [];
    
    for (const item of items) {
        if (!item.inventory_number) {
            invalidItems.push({ ...item, error: 'Inventory number is required' });
            continue;
        }
        
        if (!item.room_id) {
            invalidItems.push({ ...item, error: 'Room ID is required' });
            continue;
        }
        
        validItems.push(item);
    }
    
    return { validItems, invalidItems };
}

module.exports = {
    parseExcelFile,
    parseExcelBuffer,
    validateItems
};
