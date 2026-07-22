-- Migration: Additional Database Optimizations
-- Up

-- Ensure all foreign key columns have indexes (already created in individual migrations)
-- This migration ensures any missing indexes are created

-- Organizations table indexes
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);

-- Buildings table indexes
CREATE INDEX IF NOT EXISTS idx_buildings_organization_id ON buildings(organization_id);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);

-- Rooms table indexes
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_name ON rooms(name);

-- Inventory items table indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_room_id ON inventory_items(room_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_inventory_number ON inventory_items(inventory_number);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- History logs table indexes
CREATE INDEX IF NOT EXISTS idx_history_logs_organization_id ON history_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_building_id ON history_logs(building_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_room_id ON history_logs(room_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_action_type ON history_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_history_logs_created_at ON history_logs(created_at);

-- Composite indexes for common query patterns
-- For searching inventory items by room and status
CREATE INDEX IF NOT EXISTS idx_inventory_items_room_status ON inventory_items(room_id, status);

-- For searching inventory items by room and category
CREATE INDEX IF NOT EXISTS idx_inventory_items_room_category ON inventory_items(room_id, category);

-- For history logs date range queries
CREATE INDEX IF NOT EXISTS idx_history_logs_date_range ON history_logs(created_at DESC);

-- Down (for rollback)
-- DROP INDEX IF EXISTS idx_organizations_name;
-- DROP INDEX IF EXISTS idx_buildings_organization_id;
-- DROP INDEX IF EXISTS idx_buildings_name;
-- DROP INDEX IF EXISTS idx_rooms_building_id;
-- DROP INDEX IF EXISTS idx_rooms_name;
-- DROP INDEX IF EXISTS idx_inventory_items_room_id;
-- DROP INDEX IF EXISTS idx_inventory_items_status;
-- DROP INDEX IF EXISTS idx_inventory_items_category;
-- DROP INDEX IF EXISTS idx_inventory_items_inventory_number;
-- DROP INDEX IF EXISTS idx_users_username;
-- DROP INDEX IF EXISTS idx_users_role;
-- DROP INDEX IF EXISTS idx_history_logs_organization_id;
-- DROP INDEX IF EXISTS idx_history_logs_building_id;
-- DROP INDEX IF EXISTS idx_history_logs_room_id;
-- DROP INDEX IF EXISTS idx_history_logs_action_type;
-- DROP INDEX IF EXISTS idx_history_logs_created_at;
-- DROP INDEX IF EXISTS idx_inventory_items_room_status;
-- DROP INDEX IF EXISTS idx_inventory_items_room_category;
-- DROP INDEX IF EXISTS idx_history_logs_date_range;
