-- Migration: Add authentication actions to action_type_enum
-- Up

-- Add new values to the enum type
ALTER TYPE action_type_enum ADD VALUE IF NOT EXISTS 'login';
ALTER TYPE action_type_enum ADD VALUE IF NOT EXISTS 'logout';

-- Down (for rollback)
-- Note: PostgreSQL doesn't support removing values from enum types easily
-- This would require creating a new type, updating the table, and dropping the old type
-- For simplicity, we don't implement rollback for enum additions
