-- Migration: Create Rooms Table
-- Up

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER,
    building_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_rooms_building
        FOREIGN KEY (building_id)
        REFERENCES buildings(id)
        ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_name ON rooms(name);

-- Trigger for rooms table
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Down (for rollback)
-- DROP TABLE IF EXISTS rooms;
-- DROP INDEX IF EXISTS idx_rooms_building_id;
-- DROP INDEX IF EXISTS idx_rooms_name;
-- DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
