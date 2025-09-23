-- Adding new fields to users table for complete driver information
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN license_number VARCHAR(50);
ALTER TABLE users ADD COLUMN license_expiry_date DATE;
ALTER TABLE users ADD COLUMN photo_url TEXT;
ALTER TABLE users ADD COLUMN emergency_contact_name VARCHAR(255);
ALTER TABLE users ADD COLUMN emergency_contact_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN last_medical_visit DATE;
ALTER TABLE users ADD COLUMN notes TEXT;
