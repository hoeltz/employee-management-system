import { api, APIError } from "encore.dev/api";
import { employeeDB } from "./db";
import { BulkUploadRequest, BulkUploadResponse } from "./types";

// Uploads multiple employees from Excel data.
export const bulkUpload = api<BulkUploadRequest, BulkUploadResponse>(
  { expose: true, method: "POST", path: "/employees/bulk-upload" },
  async (req) => {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const employee of req.employees) {
      try {
        // Validate required fields
        if (!employee.nip || !employee.nama || !employee.posisi || !employee.agama || !employee.lokasiKerja || !employee.mulaiBergabung) {
          errors.push(`Row with NIP ${employee.nip || 'unknown'}: Missing required fields`);
          failed++;
          continue;
        }

        // Check if NIP already exists
        const existing = await employeeDB.queryRow`
          SELECT id FROM employees WHERE nip = ${employee.nip}
        `;

        if (existing) {
          errors.push(`NIP ${employee.nip}: Already exists`);
          failed++;
          continue;
        }

        // Insert employee
        await employeeDB.exec`
          INSERT INTO employees (nip, nama, posisi, agama, lokasi_kerja, mulai_bergabung, alamat, foto, fotocopy_identitas)
          VALUES (${employee.nip}, ${employee.nama}, ${employee.posisi}, ${employee.agama}, ${employee.lokasiKerja}, ${employee.mulaiBergabung}, ${employee.alamat}, ${employee.foto}, ${employee.fotocopyIdentitas})
        `;

        success++;
      } catch (error: any) {
        errors.push(`NIP ${employee.nip}: ${error.message}`);
        failed++;
      }
    }

    return {
      success,
      failed,
      errors
    };
  }
);
