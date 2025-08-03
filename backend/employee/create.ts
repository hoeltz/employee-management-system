import { api, APIError } from "encore.dev/api";
import { employeeDB } from "./db";
import { CreateEmployeeRequest, Employee } from "./types";

// Creates a new employee record.
export const create = api<CreateEmployeeRequest, Employee>(
  { expose: true, method: "POST", path: "/employees" },
  async (req) => {
    try {
      const row = await employeeDB.queryRow<Employee>`
        INSERT INTO employees (nip, nama, posisi, agama, lokasi_kerja, mulai_bergabung)
        VALUES (${req.nip}, ${req.nama}, ${req.posisi}, ${req.agama}, ${req.lokasiKerja}, ${req.mulaiBergabung})
        RETURNING 
          id,
          nip,
          nama,
          posisi,
          agama,
          lokasi_kerja as "lokasiKerja",
          mulai_bergabung as "mulaiBergabung",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      if (!row) {
        throw APIError.internal("failed to create employee");
      }
      
      return row;
    } catch (error: any) {
      if (error.code === "23505") { // unique violation
        throw APIError.alreadyExists("employee with this NIP already exists");
      }
      throw error;
    }
  }
);
