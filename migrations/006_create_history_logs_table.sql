-- Migration: Create History Logs Table
-- Up

CREATE TYPE action_type_enum AS ENUM ('create', 'update', 'delete', 'import', 'export');

CREATE TABLE IF NOT EXISTS history_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    building_id UUID,
    room_id UUID,
    responsible_person VARCHAR(255),
    action_type action_type_enum NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_history_logs_organization_id ON history_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_building_id ON history_logs(building_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_room_id ON history_logs(room_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_action_type ON history_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_history_logs_created_at ON history_logs(created_at);

-- Add foreign key constraints (with SET NULL on delete to preserve history)
ALTER TABLE history_logs 
    ADD CONSTRAINT fk_history_logs_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE SET NULL;

ALTER TABLE history_logs 
    ADD CONSTRAINT fk_history_logs_building
    FOREIGN KEY (building_id)
    REFERENCES buildings(id)
    ON DELETE SET NULL;

ALTER TABLE history_logs 
    ADD CONSTRAINT fk_history_logs_room
    FOREIGN KEY (room_id)
    REFERENCES rooms(id)
    ON DELETE SET NULL;

-- Down (for rollback)
-- ALTER TABLE history_logs DROP CONSTRAINT IF EXISTS fk_history_logs_room;
-- ALTER TABLE history_logs DROP CONSTRAINT IF EXISTS fk_history_logs_building;
-- ALTER TABLE history_logs DROP CONSTRAINT IF EXISTS fk_history_logs_organization;
-- DROP TABLE IF EXISTS history_logs;
-- DROP INDEX IF EXISTS idx_history_logs_organization_id;
-- DROP INDEX IF EXISTS idx_history_logs_building_id;
-- DROP INDEX IF EXISTS idx_history_logs_room_id;
-- DROP INDEX IF EXISTS idx_history_logs_action_type;
-- DROP INDEX IF EXISTS idx_history_logs_created_at;
-- DROP TYPE IF EXISTS action_type_enum;
