-- 1. Tabel Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Users
CREATE TYPE user_role AS ENUM ('hrd', 'karyawan');
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role user_role DEFAULT 'karyawan',
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Work Locations (Geofencing)
CREATE TABLE work_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Schedules
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0: Sunday, 1: Monday, etc.
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Attendances
CREATE TYPE attendance_status AS ENUM ('hadir', 'terlambat', 'alpha', 'izin', 'sakit');
CREATE TABLE attendances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    schedule_id INTEGER REFERENCES schedules(id),
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    status attendance_status DEFAULT 'hadir',
    late_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Leave Requests
CREATE TYPE leave_type AS ENUM ('izin', 'sakit', 'cuti');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status leave_status DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id), -- HRD ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Salaries
CREATE TABLE salaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary DECIMAL(15, 2) NOT NULL,
    allowances DECIMAL(15, 2) DEFAULT 0,
    deductions DECIMAL(15, 2) DEFAULT 0,
    net_salary DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Attendance Rules
CREATE TABLE attendance_rules (
    id SERIAL PRIMARY KEY,
    tolerance_minutes INTEGER DEFAULT 15,
    absent_after_minutes INTEGER DEFAULT 60,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing (Optional)
INSERT INTO departments (name, description) VALUES ('IT', 'Information Technology Department'), ('HRD', 'Human Resource Department');
