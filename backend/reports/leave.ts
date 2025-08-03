import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { ReportRequest, LeaveReport } from "../employee/types";

const employeeDB = SQLDatabase.named("employee");

// Generates leave report for employees.
export const leaveReport = api<ReportRequest, { reports: LeaveReport[] }>(
  { expose: true, method: "POST", path: "/reports/leave" },
  async (req) => {
    let whereClause = "WHERE lr.start_date >= $1 AND lr.end_date <= $2";
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
        COUNT(lr.id) as "totalRequests",
        COUNT(CASE WHEN lr.status = 'approved' THEN 1 END) as "approvedRequests",
        COUNT(CASE WHEN lr.status = 'pending' THEN 1 END) as "pendingRequests",
        COUNT(CASE WHEN lr.status = 'rejected' THEN 1 END) as "rejectedRequests"
      FROM employees e
      LEFT JOIN leave_requests lr ON e.id = lr.employee_id AND lr.start_date >= $1 AND lr.end_date <= $2
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

    const reports: LeaveReport[] = [];

    for (const result of results) {
      // Get detailed leave records
      const leaveQuery = `
        SELECT 
          id,
          employee_id as "employeeId",
          leave_type as "leaveType",
          start_date as "startDate",
          end_date as "endDate",
          days_requested as "daysRequested",
          reason,
          status,
          approved_by as "approvedBy",
          approved_at as "approvedAt",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM leave_requests
        WHERE employee_id = $1 AND start_date >= $2 AND end_date <= $3
        ORDER BY start_date DESC
      `;

      const leaveRecords = await employeeDB.rawQueryAll<any>(
        leaveQuery,
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
        totalRequests: parseInt(result.totalRequests) || 0,
        approvedRequests: parseInt(result.approvedRequests) || 0,
        pendingRequests: parseInt(result.pendingRequests) || 0,
        rejectedRequests: parseInt(result.rejectedRequests) || 0,
        leaveRecords
      });
    }

    return { reports };
  }
);
