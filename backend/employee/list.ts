import { api } from "encore.dev/api";
import { employeeDB } from "./db";
import { ListEmployeesRequest, ListEmployeesResponse, Employee } from "./types";

// Retrieves all employees with optional filtering and pagination.
export const list = api<ListEmployeesRequest, ListEmployeesResponse>(
  { expose: true, method: "GET", path: "/employees" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "";
    const params: any[] = [];
    let paramIndex = 1;
    
    if (req.lokasiKerja && req.lokasiKerja !== "all") {
      whereClause += ` WHERE lokasi_kerja = $${paramIndex}`;
      params.push(req.lokasiKerja);
      paramIndex++;
    }
    
    if (req.posisi && req.posisi !== "all") {
      whereClause += whereClause ? ` AND posisi = $${paramIndex}` : ` WHERE posisi = $${paramIndex}`;
      params.push(req.posisi);
      paramIndex++;
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM employees${whereClause}`;
    const countResult = await employeeDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;
    
    // Get employees
    const employeesQuery = `
      SELECT 
        id,
        nip,
        nama,
        posisi,
        agama,
        lokasi_kerja as "lokasiKerja",
        mulai_bergabung as "mulaiBergabung",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM employees
      ${whereClause}
      ORDER BY mulai_bergabung DESC, nama ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const employees = await employeeDB.rawQueryAll<Employee>(
      employeesQuery, 
      ...params, 
      limit, 
      offset
    );
    
    return {
      employees,
      total
    };
  }
);
