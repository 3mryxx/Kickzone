-- ====================================================
-- KICKZONE — Database Setup
-- Run this once in phpMyAdmin or MySQL CLI:
--   mysql -u root -p < setup.sql
-- ====================================================

CREATE DATABASE IF NOT EXISTS kickzone
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kickzone;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(120)    NOT NULL,
    email           VARCHAR(200)    NOT NULL UNIQUE,
    phone           VARCHAR(20)     DEFAULT NULL,
    password        VARCHAR(255)    DEFAULT NULL,   -- bcrypt hash (null for OAuth users)
    role            ENUM('user','admin') NOT NULL DEFAULT 'user',
    oauth_provider  VARCHAR(50)     DEFAULT NULL,    -- 'google' or 'facebook'
    oauth_id        VARCHAR(255)    DEFAULT NULL,    -- provider's user ID
    avatar_url      VARCHAR(500)    DEFAULT NULL,    -- for OAuth profile pics
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Fields table (seed data)
CREATE TABLE IF NOT EXISTS fields (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120)    NOT NULL,
    location    VARCHAR(200)    NOT NULL,
    governorate VARCHAR(80)     NOT NULL,
    sport_type  VARCHAR(60)     NOT NULL DEFAULT 'Football',
    price_hour  DECIMAL(8,2)   NOT NULL,
    rating      DECIMAL(3,2)   NOT NULL DEFAULT 4.5,
    image_url   VARCHAR(500)    DEFAULT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id         INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED    NOT NULL,
    field_id   INT UNSIGNED    NOT NULL,
    date       DATE            NOT NULL,
    start_time TIME            NOT NULL,
    end_time   TIME            NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status     ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_id      INT UNSIGNED    NOT NULL,
    user_id         INT UNSIGNED    NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL,
    payment_method  VARCHAR(50)     NOT NULL,   -- 'card', 'wallet', 'cash'
    payment_status  ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
    transaction_id  VARCHAR(255)    DEFAULT NULL,
    reference_code  VARCHAR(50)     UNIQUE NOT NULL,
    notes           TEXT            DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)  ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_created (created_at)
) ENGINE=InnoDB;

-- ── Seed fields (27 fields across Egypt) ──────────────
INSERT INTO fields (name, location, governorate, sport_type, price_hour, rating, image_url) VALUES
('Champions Arena',     'Maadi, Cairo',           'Cairo',       'Football', 350.00, 4.9, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500&q=80'),
('Stars Field',         'Zamalek, Cairo',          'Cairo',       'Football', 420.00, 4.8, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&q=80'),
('Heliopolis Ground',   'Heliopolis, Cairo',       'Cairo',       'Futsal',   280.00, 4.6, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80'),
('Pro Pitch Alex',      'Stanley, Alexandria',     'Alexandria',  'Football', 300.00, 4.7, 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&q=80'),
('Corniche Arena',      'Miami, Alexandria',       'Alexandria',  'Football', 250.00, 4.5, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80'),
('Pyramids Field',      'Haram, Giza',             'Giza',        'Football', 200.00, 4.4, 'https://images.unsplash.com/photo-1518604964726-6ae8c99c5b5e?w=500&q=80'),
('Dokki Sports Club',   'Dokki, Giza',             'Giza',        'Futsal',   320.00, 4.7, 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500&q=80'),
('October Arena',       '6th October City',        '6th October', 'Football', 180.00, 4.3, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80'),
('Cairo Festival Pitch','New Cairo',               'New Cairo',   'Football', 450.00, 4.9, 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=500&q=80'),
('East Field',          'Rehab City, New Cairo',   'New Cairo',   'Football', 380.00, 4.6, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&q=80'),
('Maadi Club Field',    'Maadi, Cairo',            'Cairo',       'Football', 500.00, 4.8, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80'),
('Nasr City Ground',    'Nasr City, Cairo',        'Cairo',       'Futsal',   240.00, 4.2, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80'),
('El Ahly Training',    'Mokattam, Cairo',         'Cairo',       'Football', 600.00, 5.0, 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=500&q=80'),
('Downtown Pitch',      'Downtown Cairo',          'Cairo',       'Futsal',   220.00, 4.1, 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&q=80'),
('Alex Sports Complex', 'Smouha, Alexandria',      'Alexandria',  'Football', 320.00, 4.6, 'https://images.unsplash.com/photo-1518604964726-6ae8c99c5b5e?w=500&q=80'),
('Borg El-Arab Stadium','Borg El-Arab, Alex',      'Alexandria',  'Football', 400.00, 4.8, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&q=80'),
('Giza Stadium Field',  'Mohandessen, Giza',       'Giza',        'Football', 280.00, 4.5, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80'),
('Dream Park Pitch',    '6th October City',        '6th October', 'Football', 220.00, 4.4, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80'),
('El-Tagamoa Ground',   'El-Tagamoa, New Cairo',   'New Cairo',   'Futsal',   340.00, 4.5, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80'),
('Mansoura Pitch',      'El Mansoura City',        'Mansoura',    'Football', 150.00, 4.3, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80'),
('Dakahlia Arena',      'Mansoura, Dakahlia',      'Mansoura',    'Football', 130.00, 4.1, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500&q=80'),
('Tanta Stadium Field', 'Tanta, Gharbia',          'Tanta',       'Football', 140.00, 4.2, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&q=80'),
('Aswan Nile Pitch',    'Aswan City',              'Aswan',       'Football', 120.00, 4.0, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80'),
('Luxor West Bank Field','Luxor City',             'Luxor',       'Football', 100.00, 4.0, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80'),
('Canal Zone Stadium',  'Port Said City',          'Port Said',   'Football', 160.00, 4.3, 'https://images.unsplash.com/photo-1518604964726-6ae8c99c5b5e?w=500&q=80'),
('Suez Canal Arena',    'Suez City',               'Suez',        'Football', 170.00, 4.2, 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500&q=80'),
('Ismailia Sports Field','Ismailia City',          'Ismailia',    'Football', 155.00, 4.2, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80');

-- ── Indexes for performance ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_user    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_field   ON bookings(field_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date    ON bookings(date);

-- ── Seed test admin user ───────────────────────────
INSERT INTO users (full_name, email, password, role) VALUES
('Admin User', 'admin@kickzone.test', '$2y$10$YIjlrBxJL9p6p.BYV1HELeL7V5X6I6VvVnJKQr5NkJ5r.7c2q8Yy2', 'admin');
