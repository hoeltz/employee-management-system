-- Add new columns to employees table
ALTER TABLE employees 
ADD COLUMN alamat TEXT,
ADD COLUMN foto TEXT,
ADD COLUMN fotocopy_identitas TEXT;

-- Create index for better performance
CREATE INDEX idx_employees_alamat ON employees USING gin(to_tsvector('indonesian', alamat));
