-- ============================================================
-- PostgreSQL Seed Data for Student Management System
-- Default password: password123
-- Bcrypt hash: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va
-- Run this in: Neon Console → SQL Editor
-- ============================================================

-- ── ADMIN user ──────────────────────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'ADMIN', 'Administrator', 'admin@example.com')
ON CONFLICT (username) DO NOTHING;

-- ── STAFF user ───────────────────────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('staff', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STAFF', 'System Staff', 'staff@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO staff (id, name, email, department)
SELECT id, 'System Staff', 'staff@example.com', 'Information Technology'
FROM users WHERE username = 'staff'
ON CONFLICT (id) DO NOTHING;

-- ── STUDENT: 23IT001 – AASANTH M ────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT001', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'AASANTH M', '23IT001@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'AASANTH M', '23IT001@example.com', '6374106124',
       '5/145 Maruthaiyan Kovil Street, Goodamalai (PO), Gangavalli (TK)',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT001'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 48, 50 FROM users WHERE username = '23IT001';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 44, 50 FROM users WHERE username = '23IT001';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 27, 50 FROM users WHERE username = '23IT001';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 35, 50 FROM users WHERE username = '23IT001';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 35, 50 FROM users WHERE username = '23IT001';

-- ── STUDENT: 23IT002 – AJAYPRABHAKAR S R ────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT002', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'AJAYPRABHAKAR S R', '23IT002@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'AJAYPRABHAKAR S R', '23IT002@example.com', '8220309258',
       '7/8A, West Street, Singalandapuram (PO), Rasipuram (TK)',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT002'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 39, 50 FROM users WHERE username = '23IT002';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 40, 50 FROM users WHERE username = '23IT002';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 12, 50 FROM users WHERE username = '23IT002';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 37, 50 FROM users WHERE username = '23IT002';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 32, 50 FROM users WHERE username = '23IT002';

-- ── STUDENT: 23IT003 – AJAYPRASANNA P ───────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT003', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'AJAYPRASANNA P', '23IT003@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'AJAYPRASANNA P', '23IT003@example.com', '9943477485',
       '163/40, Krishnan Kovil Street, Ammapet',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT003'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 38, 50 FROM users WHERE username = '23IT003';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 36, 50 FROM users WHERE username = '23IT003';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 39, 50 FROM users WHERE username = '23IT003';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 26, 50 FROM users WHERE username = '23IT003';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 31, 50 FROM users WHERE username = '23IT003';

-- ── STUDENT: 23IT004 – ARULMOZHI R ──────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT004', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'ARULMOZHI R', '23IT004@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'ARULMOZHI R', '23IT004@example.com', '9345377977',
       '2/142, Kosavampalayam, Ramapuram (PO), Tiruchengode (TK)',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT004'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 47, 50 FROM users WHERE username = '23IT004';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 42, 50 FROM users WHERE username = '23IT004';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 44, 50 FROM users WHERE username = '23IT004';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 45, 50 FROM users WHERE username = '23IT004';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 42, 50 FROM users WHERE username = '23IT004';

-- ── STUDENT: 23IT005 – ASHWINI M ────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT005', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'ASHWINI M', '23IT005@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'ASHWINI M', '23IT005@example.com', '9688000782',
       '2/276, Kittampatti, Jittandhalli (PO), Palacode (TK)',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT005'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 48, 50 FROM users WHERE username = '23IT005';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 43, 50 FROM users WHERE username = '23IT005';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 46, 50 FROM users WHERE username = '23IT005';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 44, 50 FROM users WHERE username = '23IT005';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 44, 50 FROM users WHERE username = '23IT005';

-- ── STUDENT: 23IT006 – ATCHAYA M ────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT006', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'ATCHAYA M', '23IT006@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'ATCHAYA M', '23IT006@example.com', '7540052219',
       'Anbu Nagar, Valakombai Cross Road, Thammapatti (PO), Gangavalli (TK)',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT006'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 47, 50 FROM users WHERE username = '23IT006';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 44, 50 FROM users WHERE username = '23IT006';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 47, 50 FROM users WHERE username = '23IT006';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 45, 50 FROM users WHERE username = '23IT006';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 42, 50 FROM users WHERE username = '23IT006';

-- ── STUDENT: 23IT007 – BALAJI M ─────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT007', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'BALAJI M', '23IT007@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'BALAJI M', '23IT007@example.com', '6382317348',
       '75/12 A, Grain Bazaar, Pudupet (PO), Attur (TK)',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT007'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 44, 50 FROM users WHERE username = '23IT007';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 41, 50 FROM users WHERE username = '23IT007';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 41, 50 FROM users WHERE username = '23IT007';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 43, 50 FROM users WHERE username = '23IT007';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 40, 50 FROM users WHERE username = '23IT007';

-- ── STUDENT: 23IT008 – BARATH C ─────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT008', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'BARATH C', '23IT008@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'BARATH C', '23IT008@example.com', '6381209825',
       '23/11, Periya Kinaru Street, Ammapet',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT008'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', NULL, 50 FROM users WHERE username = '23IT008';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', NULL, 50 FROM users WHERE username = '23IT008';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 7, 50 FROM users WHERE username = '23IT008';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 29, 50 FROM users WHERE username = '23IT008';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 35, 50 FROM users WHERE username = '23IT008';

-- ── STUDENT: 23IT009 – DEEPAK P ─────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT009', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'DEEPAK P', '23IT009@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'DEEPAK P', '23IT009@example.com', '9677628533',
       '7/48-C, Millukkadu, Vadugapatti, Oruvandur (PO), Mohanur (TK)',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT009'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 46, 50 FROM users WHERE username = '23IT009';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 41, 50 FROM users WHERE username = '23IT009';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', 42, 50 FROM users WHERE username = '23IT009';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 45, 50 FROM users WHERE username = '23IT009';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 38, 50 FROM users WHERE username = '23IT009';

-- ── STUDENT: 23IT010 – DEEPAK S ─────────────────────────────
INSERT INTO users (username, password, role, name, email)
VALUES ('23IT010', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb4va', 'STUDENT', 'DEEPAK S', '23IT010@example.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO students (id, name, email, phone_number, address, department, course, year, semester)
SELECT id, 'DEEPAK S', '23IT010@example.com', '8838714004',
       '1/138, Periyahambikottai, Anakode (PO), Pochampalli (TK)',
       'Information Technology', 'B.Tech IT', '2023', '2'
FROM users WHERE username = '23IT010'
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'MC', 'Final', 44, 50 FROM users WHERE username = '23IT010';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'PCD', 'Final', 35, 50 FROM users WHERE username = '23IT010';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'CC AWS', 'Final', NULL, 50 FROM users WHERE username = '23IT010';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'WT', 'Final', 40, 50 FROM users WHERE username = '23IT010';
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, max_marks)
SELECT id, 'DK', 'Final', 36, 50 FROM users WHERE username = '23IT010';
