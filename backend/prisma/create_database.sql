-- Create the ai_marking database
CREATE DATABASE IF NOT EXISTS ai_marking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE ai_marking;

-- Grant privileges (adjust username/password as needed)
-- GRANT ALL PRIVILEGES ON ai_marking.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Database ai_marking created successfully!' AS Message;
