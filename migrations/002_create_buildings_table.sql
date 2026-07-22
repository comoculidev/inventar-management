-- Migration: Create Buildings Table
-- Up

CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_buildings_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_buildings_organization_id ON buildings(organization_id);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);

-- Trigger for buildings table
CREATE TRIGGER update_buildings_updated_at
    BEFORE UPDATE ON buildings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Down (for rollback)
-- DROP TABLE IF EXISTS buildings;
-- DROP INDEX IF EXISTS idx_buildings_organization_id;
-- DROP INDEX IF EXISTS idx_buildings_name;
-- DROP TRIGGER IF EXISTS update_buildings_updated_at ON buildings;
