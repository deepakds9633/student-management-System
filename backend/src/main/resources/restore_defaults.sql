-- Default Users Restoration Script
-- Default password 'password123' (bcrypt hashed: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va)

-- Check and Create ADMIN user
INSERT INTO users (username, password, role) 
SELECT 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Check and Create STAFF user
-- Note: id might vary, so we should ensure it's correct for staff table too
INSERT INTO users (username, password, role) 
SELECT 'staff', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STAFF'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'staff');

SET @staff_user_id = (SELECT id FROM users WHERE username = 'staff');

-- Ensure staff table exists and insert staff entry
CREATE TABLE IF NOT EXISTS staff (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO staff (id, name, email, department)
SELECT @staff_user_id, 'System Staff', 'staff@example.com', 'Administration'
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE id = @staff_user_id);
