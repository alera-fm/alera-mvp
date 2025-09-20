-- Migration 036: Remove problematic release date constraint
-- Date: 2025-01-27
-- Description: Remove the check_release_date_future constraint that was preventing
--              admin status updates on existing releases. The constraint was too
--              restrictive and checked against current date on every UPDATE operation.

-- Drop the existing problematic constraint
ALTER TABLE releases DROP CONSTRAINT IF EXISTS check_release_date_future;

-- Note: We're removing this constraint because:
-- 1. It was preventing admin status updates on existing releases
-- 2. It checked against CURRENT_DATE on every UPDATE, not just INSERT
-- 3. It was too restrictive for administrative operations
-- 4. The frontend validation already ensures proper release dates for new releases
