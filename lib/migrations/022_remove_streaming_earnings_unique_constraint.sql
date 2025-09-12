-- Remove unique constraint from streaming_earnings table to allow duplicate records
-- This allows legitimate duplicate entries (same song, platform, month, country but different quantities/earnings)

-- Drop the existing unique constraint
ALTER TABLE streaming_earnings 
DROP CONSTRAINT IF EXISTS streaming_earnings_artist_id_sale_month_platform_title_coun_key;

-- Note: This allows duplicate records which is necessary for accurate revenue reporting
-- where the same song can have multiple transactions on the same platform in the same month
