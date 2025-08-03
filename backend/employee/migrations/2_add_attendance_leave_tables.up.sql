-- Add attendance table
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(20) NOT NULL DEFAULT 'present', -- present, absent, late, half_day
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add leave requests table
CREATE TABLE leave_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- annual, sick, personal, maternity, etc
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_by BIGINT REFERENCES employees(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add invoices table for tracking
CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add users table for admin management
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- admin, manager, user
  employee_id BIGINT REFERENCES employees(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add settings table for system configuration
CREATE TABLE settings (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_invoices_employee ON invoices(employee_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_settings_key ON settings(key);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('company_name', 'PT. Example Company', 'Company name displayed in reports'),
('company_logo', '', 'Company logo URL or base64 data'),
('working_hours_start', '08:00', 'Standard working hours start time'),
('working_hours_end', '17:00', 'Standard working hours end time'),
('annual_leave_days', '12', 'Default annual leave days per year');
