import { api, APIError } from "encore.dev/api";
import { employeeDB } from "./db";
import { UpdateEmployeeRequest, Employee } from "./types";

// Updates an existing employee record.
export const update = api<UpdateEmployeeRequest, Employee>(
  { expose: true, method: "PUT", path: "/employees/:id" },
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (req.nama !== undefined) {
      updates.push(`nama = $${paramIndex}`);
      params.push(req.nama);
      paramIndex++;
    }
    
    if (req.posisi !== undefined) {
      updates.push(`posisi = $${paramIndex}`);
      params.push(req.posisi);
      paramIndex++;
    }
    
    if (req.agama !== undefined) {
      updates.push(`agama = $${paramIndex}`);
      params.push(req.agama);
      paramIndex++;
    }
    
    if (req.lokasiKerja !== undefined) {
      updates.push(`lokasi_kerja = $${paramIndex}`);
      params.push(req.lokasiKerja);
      paramIndex++;
    }
    
    if (req.mulaiBergabung !== undefined) {
      updates.push(`mulai_bergabung = $${paramIndex}`);
      params.push(req.mulaiBergabung);
      paramIndex++;
    }
    
    if (req.alamat !== undefined) {
      updates.push(`alamat = $${paramIndex}`);
      params.push(req.alamat);
      paramIndex++;
    }
    
    if (req.foto !== undefined) {
      updates.push(`foto = $${paramIndex}`);
      params.push(req.foto);
      paramIndex++;
    }
    
    if (req.fotocopyIdentitas !== undefined) {
      updates.push(`fotocopy_identitas = $${paramIndex}`);
      params.push(req.fotocopyIdentitas);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.id);
    
    const query = `
      UPDATE employees 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING 
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
    `;
    
    const row = await employeeDB.rawQueryRow<Employee>(query, ...params);
    
    if (!row) {
      throw APIError.notFound("employee not found");
    }
    
    return row;
  }
);
