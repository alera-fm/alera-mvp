# Database Migrations

This directory contains database migration files that should be run in order to update the database schema.

## How to run migrations

1. Connect to your PostgreSQL database
2. Run each migration file in numerical order
3. Keep track of which migrations have been applied

## Available Migrations

1. **001_fix_streaming_earnings_artist_id.sql** - Fixes the artist_id column type from INTEGER to match the users table
2. **002_create_default_user.sql** - Creates a default user with id=1 for revenue uploads  
3. **003_create_payout_methods_table.sql** - Creates the payout_methods table for storing encrypted payout information

## Migration Files

- `001_fix_streaming_earnings_artist_id.sql` - Fixes the artist_id type mismatch in streaming_earnings table

## Future Changes

Always create new migration files instead of modifying existing schema files. This ensures:
- Version control of database changes
- Ability to rollback changes if needed
- Clear history of what changed and when
- Easier deployment across different environments
