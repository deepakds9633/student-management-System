-- Student Data Insertion Script
-- Default password 'password123' (bcrypt hashed: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va)

-- Ensure tables exist
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phoneNumber VARCHAR(20),
    address VARCHAR(500),
    department VARCHAR(255),
    course VARCHAR(255),
    year VARCHAR(10),
    semester VARCHAR(10),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    examType VARCHAR(50) NOT NULL,
    marksObtained INT,
    maxMarks INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);


-- 23IT001 – AASANTH M
INSERT INTO users (username, password, role) VALUES ('23IT001', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_01 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_01, 'AASANTH M', '23IT001@example.com', '6374106124', '5/145 Maruthaiyan Kovil Street, Goodamalai (PO), Gangavalli (TK)', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_01, 'MC', 'Final', 48, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_01, 'PCD', 'Final', 44, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_01, 'CC AWS', 'Final', 27, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_01, 'WT', 'Final', 35, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_01, 'DK', 'Final', 35, 50);

-- 23IT002 – AJAYPRABHAKAR S R
INSERT INTO users (username, password, role) VALUES ('23IT002', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_02 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_02, 'AJAYPRABHAKAR S R', '23IT002@example.com', '8220309258', '7/8A, West Street, Singalandapuram (PO), Rasipuram (TK)', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_02, 'MC', 'Final', 39, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_02, 'PCD', 'Final', 40, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_02, 'CC AWS', 'Final', 12, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_02, 'WT', 'Final', 37, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_02, 'DK', 'Final', 32, 50);

-- 23IT003 – AJAYPRASANNA P
INSERT INTO users (username, password, role) VALUES ('23IT003', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_03 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_03, 'AJAYPRASANNA P', '23IT003@example.com', '9943477485', '163/40, Krishnan Kovil Street, Ammapet', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_03, 'MC', 'Final', 38, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_03, 'PCD', 'Final', 36, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_03, 'CC AWS', 'Final', 39, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_03, 'WT', 'Final', 26, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_03, 'DK', 'Final', 31, 50);

-- 23IT004 – ARULMOZHI R
INSERT INTO users (username, password, role) VALUES ('23IT004', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_04 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_04, 'ARULMOZHI R', '23IT004@example.com', '9345377977', '2/142, Kosavampalayam, Ramapuram (PO), Tiruchengode (TK)', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_04, 'MC', 'Final', 47, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_04, 'PCD', 'Final', 42, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_04, 'CC AWS', 'Final', 44, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_04, 'WT', 'Final', 45, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_04, 'DK', 'Final', 42, 50);

-- 23IT005 – ASHWINI M
INSERT INTO users (username, password, role) VALUES ('23IT005', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_05 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_05, 'ASHWINI M', '23IT005@example.com', '9688000782', '2/276, Kittampatti, Jittandhalli (PO), Palacode (TK)', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_05, 'MC', 'Final', 48, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_05, 'PCD', 'Final', 43, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_05, 'CC AWS', 'Final', 46, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_05, 'WT', 'Final', 44, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_05, 'DK', 'Final', 44, 50);

-- 23IT006 – ATCHAYA M
INSERT INTO users (username, password, role) VALUES ('23IT006', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_06 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_06, 'ATCHAYA M', '23IT006@example.com', '7540052219', 'Anbu Nagar, Valakombai Cross Road, Thammapatti (PO), Gangavalli (TK)', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_06, 'MC', 'Final', 47, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_06, 'PCD', 'Final', 44, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_06, 'CC AWS', 'Final', 47, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_06, 'WT', 'Final', 45, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_06, 'DK', 'Final', 42, 50);

-- 23IT007 – BALAJI M
INSERT INTO users (username, password, role) VALUES ('23IT007', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_07 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_07, 'BALAJI M', '23IT007@example.com', '6382317348', '75/12 A, Grain Bazaar, Pudupet (PO), Attur (TK)', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_07, 'MC', 'Final', 44, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_07, 'PCD', 'Final', 41, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_07, 'CC AWS', 'Final', 41, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_07, 'WT', 'Final', 43, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_07, 'DK', 'Final', 40, 50);

-- 23IT008 – BARATH C
INSERT INTO users (username, password, role) VALUES ('23IT008', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_08 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_08, 'BARATH C', '23IT008@example.com', '6381209825', '23/11, Periya Kinaru Street, Ammapet', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_08, 'MC', 'Final', NULL, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_08, 'PCD', 'Final', NULL, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_08, 'CC AWS', 'Final', 7, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_08, 'WT', 'Final', 29, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_08, 'DK', 'Final', 35, 50);

-- 23IT009 – DEEPAK P
INSERT INTO users (username, password, role) VALUES ('23IT009', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_09 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_09, 'DEEPAK P', '23IT009@example.com', '9677628533', '7/48-C, Millukkadu, Vadugapatti, Oruvandur (PO), Mohanur (TK)', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_09, 'MC', 'Final', 46, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_09, 'PCD', 'Final', 41, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_09, 'CC AWS', 'Final', 42, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_09, 'WT', 'Final', 45, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_09, 'DK', 'Final', 38, 50);

-- 23IT010 – DEEPAK S
INSERT INTO users (username, password, role) VALUES ('23IT010', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT');
SET @user_id_10 = LAST_INSERT_ID();
INSERT INTO students (id, name, email, phoneNumber, address, department, course, year, semester) 
VALUES (@user_id_10, 'DEEPAK S', '23IT010@example.com', '8838714004', '1/138, Periyahambikottai, Anakode (PO), Pochampalli (TK)', 'Information Technology', 'B.Tech IT', '2023', '2');
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_10, 'MC', 'Final', 44, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_10, 'PCD', 'Final', 35, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_10, 'CC AWS', 'Final', NULL, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_10, 'WT', 'Final', 40, 50);
INSERT INTO marks (student_id, subject, examType, marksObtained, maxMarks) VALUES (@user_id_10, 'DK', 'Final', 36, 50);
