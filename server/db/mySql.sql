-- gymflow_database_updated.sql

-- יצירת מסד הנתונים
CREATE DATABASE IF NOT EXISTS gymflow_db;
USE gymflow_db;

-- טבלה: users (משתמשים)
-- שדה הסיסמה הוסר מכאן
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    user_type ENUM('trainee', 'trainer', 'admin') NOT NULL,
    profile_picture_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- טבלה חדשה: user_credentials (פרטי כניסה של משתמשים)
-- אחסון נפרד של סיסמאות מגובבות (hashed) ו-salt (אם משתמשים)
CREATE TABLE user_credentials (
    user_id INT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL, -- בפועל, גודל השדה צריך להיות מותאם לאלגוריתם הגיבוב (לדוגמה, 60-99 עבור bcrypt)
    salt VARCHAR(255), -- אם משתמשים ב-salt חיצוני (לרוב כלול ב-hash)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- טבלה: trainees (מתאמנים)
CREATE TABLE trainees (
    user_id INT PRIMARY KEY,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- טבלה: trainers (מאמנים)
CREATE TABLE trainers (
    user_id INT PRIMARY KEY,
    specialization VARCHAR(255),
    bio TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- טבלה: rooms (חדרים)
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    description TEXT
);

-- טבלה: classes (חוגים)
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trainer_id INT NOT NULL,
    room_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    max_capacity INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- טבלה: class_registrations (הרשמות לחוגים)
CREATE TABLE class_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trainee_id INT NOT NULL,
    class_id INT NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'cancelled', 'attended') NOT NULL,
    FOREIGN KEY (trainee_id) REFERENCES trainees(user_id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE (trainee_id, class_id) -- מונע רישום כפול לאותו חוג
);

-- טבלה: subscriptions (מנויים)
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL, -- משך המנוי בימים
    max_classes_per_month INT, -- מגבלת חוגים לחודש (NULL אם אין הגבלה)
    is_active BOOLEAN DEFAULT TRUE
);

-- טבלה: user_subscriptions (מנויים של משתמשים)
CREATE TABLE user_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trainee_id INT NOT NULL,
    subscription_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE, -- האם המנוי עדיין בתוקף
    FOREIGN KEY (trainee_id) REFERENCES trainees(user_id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- טבלה: payments (תשלומים)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_subscription_id INT, -- קשר למנוי ששולם עבורו (NULL אם התשלום הוא על דבר אחר)
    trainee_id INT NOT NULL, -- מי שילם
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS', -- סוג המטבע, ברירת מחדל שקלים חדשים
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('credit_card', 'bank_transfer', 'cash', 'other') NOT NULL,
    transaction_id VARCHAR(255) UNIQUE, -- ID של העסקה מצד ספק התשלום
    status ENUM('completed', 'pending', 'failed', 'refunded') NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_subscription_id) REFERENCES user_subscriptions(id),
    FOREIGN KEY (trainee_id) REFERENCES trainees(user_id)
);

-- טבלה: training_programs (תוכניות אימונים)
CREATE TABLE training_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_trainer_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_trainer_id) REFERENCES trainers(user_id)
);

-- טבלה: trainee_programs (תוכניות אימונים למתאמן ספציפי)
CREATE TABLE trainee_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trainee_id INT NOT NULL,
    program_id INT NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (trainee_id) REFERENCES trainees(user_id),
    FOREIGN KEY (program_id) REFERENCES training_programs(id)
);

-- טבלה: messages (הודעות)
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT, -- NULL עבור הודעות כלליות (broadcast)
    message_text TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    message_type ENUM('private', 'broadcast', 'class_update') NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);