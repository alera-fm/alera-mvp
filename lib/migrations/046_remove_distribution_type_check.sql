-- Remove the distribution_type check constraint that's preventing draft saves
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_distribution_type_check;
