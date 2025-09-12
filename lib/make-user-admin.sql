-- Run this query to make a user admin
-- Replace 'user@example.com' with the actual email of the user you want to make admin

UPDATE users 
SET is_admin = TRUE 
WHERE email = 'user@example.com';

-- To check if the user is now admin:
-- SELECT email, is_admin FROM users WHERE email = 'user@example.com';
