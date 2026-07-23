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
        // Also support: organization, building, room (by name)
        const item = {
            id: uuidv4(),
            inventory_number: row['\u0130nventar N\u00f6mr\u0259si'] || row['inventory_number'] || row['Inventory Number'] || '',
            location: row['Yerl\u0259\u015fm\u0259si'] || row['location'] || row['Location'] || '',
            status: row['Status'] || row['status'] || row['Status'] || '',
            responsible_person: row['M\u0259sul \u015e\u0259xs'] || row['responsible_person'] || row['Responsible Person'] || '',
            category: row['Kateqoriya'] || row['category'] || row['Category'] || '',
            room_id: row['Otaq ID'] || row['room_id'] || row['Room ID'] || '',
            // Support organization, building, room by name for lookup
            organization_name: row['T\u0259\u015fkilat'] || row['organization'] || row['Organization'] || '',
            building_name: row['Bina'] || row['building'] || row['Building'] || '',
            room_name: row['Otaq'] || row['room'] || row['Room'] || ''
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
            inventory_number: row['\u0130nventar N\u00f6mr\u0259si'] || row['inventory_number'] || row['Inventory Number'] || '',
            location: row['Yerl\u0259\u015fm\u0259si'] || row['location'] || row['Location'] || '',
            status: row['Status'] || row['status'] || row['Status'] || '',
            responsible_person: row['M\u0259sul \u015e\u0259xs'] || row['responsible_person'] || row['Responsible Person'] || '',
            category: row['Kateqoriya'] || row['category'] || row['Category'] || '',
            room_id: row['Otaq ID'] || row['room_id'] || row['Room ID'] || '',
            // Support organization, building, room by name for lookup
            organization_name: row['T\u0259\u015fkilat'] || row['organization'] || row['Organization'] || '',
            building_name: row['Bina'] || row['building'] || row['Building'] || '',
            room_name: row['Otaq'] || row['room'] || row['Room'] || ''
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
        
        // room_id is preferred, but if not provided, we can try to resolve by name
        // The controller will handle the actual lookup
        if (!item.room_id && !item.room_name) {
            invalidItems.push({ ...item, error: 'Room ID or Room name is required' });
            continue;
        }
        
        validItems.push(item);
    }
    
    return { validItems, invalidItems };
}

// Resolve room ID from organization, building, and room names
// This is a helper function to be used in the controller
async function resolveRoomId(item, Organization, Building, Room) {
    // If room_id is already provided, use it
    if (item.room_id) {
        const room = await Room.getById(item.room_id);
        if (room) return item.room_id;
    }
    
    // Try to resolve by names
    if (item.room_name) {
        // If we have organization and building names, try to find the room
        if (item.organization_name && item.building_name) {
            const org = await Organization.getByName(item.organization_name);
            if (org && org.length > 0) {
                const orgId = org[0].id;
                const bldg = await Building.getByOrganization(orgId);
                const building = bldg.find(b => b.name === item.building_name);
                if (building) {
                    const rooms = await Room.getByBuilding(building.id);
                    const room = rooms.find(r => r.name === item.room_name);
                    if (room) return room.id;
                }
            }
        }
        
        // Try to find room by name only (if unique)
        const allRooms = await Room.getAll();
        const room = allRooms.find(r => r.name === item.room_name);
        if (room) return room.id;
    }
    
    return null; // Could not resolve
}

module.exports = {
    parseExcelFile,
    parseExcelBuffer,
    validateItems,
    resolveRoomId
};
