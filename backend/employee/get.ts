import { api, APIError } from "encore.dev/api";
import { employeeDB } from "./db";
import { GetEmployeeRequest, Employee } from "./types";

// Retrieves a single employee by ID.
export const get = api<GetEmployeeRequest, Employee>(
  { expose: true, method: "GET", path: "/employees/:id" },
  async (req) => {
    const row = await employeeDB.queryRow<Employee>`
      SELECT 
        id,
        nip,
        nama,
        posisi,
        agama,
        lokasi_kerja as "lokasiKerja",
        mulai_bergabung as "mulaiBergabung",
        alamat,
        foto,
        fotocopy_identitas as "fotocopyIdentitas",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM employees 
      WHERE id = ${req.id}
    `;
    
    if (!row) {
      throw APIError.notFound("employee not found");
    }
    
    return row;
  }
);
