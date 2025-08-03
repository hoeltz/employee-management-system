import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { ReportRequest, AttendanceReport } from "../employee/types";

const employeeDB = SQLDatabase.named("employee");

// Generates attendance report for employees.
export const attendanceReport = api<ReportRequest, { reports: AttendanceReport[] }>(
  { expose: true, method: "POST", path: "/reports/attendance" },
  async (req) => {
    let whereClause = "WHERE a.date BETWEEN $1 AND $2";
    const params: any[] = [req.startDate, req.endDate];
    let paramIndex = 3;

    if (req.employeeId) {
      whereClause += ` AND e.id = $${paramIndex}`;
      params.push(req.employeeId);
      paramIndex++;
    }

    if (req.lokasiKerja && req.lokasiKerja !== "all") {
      whereClause += ` AND e.lokasi_kerja = $${paramIndex}`;
      params.push(req.lokasiKerja);
      paramIndex++;
    }

    const query = `
      SELECT 
        e.id,
        e.nip,
        e.nama,
        e.posisi,
        e.agama,
        e.lokasi_kerja as "lokasiKerja",
        e.mulai_bergabung as "mulaiBergabung",
        e.created_at as "createdAt",
        e.updated_at as "updatedAt",
        COUNT(a.id) as "totalDays",
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as "presentDays",
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as "absentDays",
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as "lateDays"
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date BETWEEN $1 AND $2
      ${req.employeeId ? 'WHERE e.id = $3' : ''}
      ${req.lokasiKerja && req.lokasiKerja !== "all" && !req.employeeId ? 'WHERE e.lokasi_kerja = $3' : ''}
      ${req.lokasiKerja && req.lokasiKerja !== "all" && req.employeeId ? 'AND e.lokasi_kerja = $4' : ''}
      GROUP BY e.id, e.nip, e.nama, e.posisi, e.agama, e.lokasi_kerja, e.mulai_bergabung, e.created_at, e.updated_at
      ORDER BY e.nama
    `;

    const reportParams = [req.startDate, req.endDate];
    if (req.employeeId) reportParams.push(req.employeeId);
    if (req.lokasiKerja && req.lokasiKerja !== "all") reportParams.push(req.lokasiKerja);

    const results = await employeeDB.rawQueryAll<any>(query, ...reportParams);

    const reports: AttendanceReport[] = [];

    for (const result of results) {
      // Get detailed attendance records
      const attendanceQuery = `
        SELECT 
          id,
          employee_id as "employeeId",
          date,
          check_in as "checkIn",
          check_out as "checkOut",
          status,
          notes,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM attendance
        WHERE employee_id = $1 AND date BETWEEN $2 AND $3
        ORDER BY date DESC
      `;

      const attendanceRecords = await employeeDB.rawQueryAll<any>(
        attendanceQuery,
        result.id,
        req.startDate,
        req.endDate
      );

      reports.push({
        employee: {
          id: result.id,
          nip: result.nip,
          nama: result.nama,
          posisi: result.posisi,
          agama: result.agama,
          lokasiKerja: result.lokasiKerja,
          mulaiBergabung: result.mulaiBergabung,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt
        },
        totalDays: parseInt(result.totalDays) || 0,
        presentDays: parseInt(result.presentDays) || 0,
        absentDays: parseInt(result.absentDays) || 0,
        lateDays: parseInt(result.lateDays) || 0,
        attendanceRecords
      });
    }

    return { reports };
  }
);
