CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  nip VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  posisi VARCHAR(255) NOT NULL,
  agama VARCHAR(50) NOT NULL,
  lokasi_kerja VARCHAR(25) NOT NULL,
  mulai_bergabung DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_nip ON employees(nip);
CREATE INDEX idx_employees_lokasi_kerja ON employees(lokasi_kerja);
CREATE INDEX idx_employees_posisi ON employees(posisi);
