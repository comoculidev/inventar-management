-- Migration: Create Inventory Items Table
-- Up

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_number VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    responsible_person VARCHAR(255),
    category VARCHAR(100),
    room_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_inventory_items_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_items_room_id ON inventory_items(room_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_inventory_number ON inventory_items(inventory_number);

-- Trigger for inventory_items table
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Down (for rollback)
-- DROP TABLE IF EXISTS inventory_items;
-- DROP INDEX IF EXISTS idx_inventory_items_room_id;
-- DROP INDEX IF EXISTS idx_inventory_items_status;
-- DROP INDEX IF EXISTS idx_inventory_items_category;
-- DROP INDEX IF EXISTS idx_inventory_items_inventory_number;
-- DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
