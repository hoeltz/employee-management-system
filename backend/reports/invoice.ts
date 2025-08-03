import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { ReportRequest, InvoiceReport } from "../employee/types";

const employeeDB = SQLDatabase.named("employee");

// Generates invoice report for employees.
export const invoiceReport = api<ReportRequest, { reports: InvoiceReport[] }>(
  { expose: true, method: "POST", path: "/reports/invoice" },
  async (req) => {
    let whereClause = "WHERE i.issue_date >= $1 AND i.issue_date <= $2";
    const params: any[] = [req.startDate, req.endDate];
    let paramIndex = 3;

    if (req.employeeId) {
      whereClause += ` AND e.id = $${paramIndex}`;
      params.push(req.employeeId);
      paramIndex++;
    }

    if (req.lokasiKerja) {
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
        COUNT(i.id) as "totalInvoices",
        COALESCE(SUM(i.amount), 0) as "totalAmount",
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as "paidAmount",
        COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END), 0) as "pendingAmount"
      FROM employees e
      LEFT JOIN invoices i ON e.id = i.employee_id AND i.issue_date >= $1 AND i.issue_date <= $2
      ${req.employeeId ? 'WHERE e.id = $3' : ''}
      ${req.lokasiKerja && !req.employeeId ? 'WHERE e.lokasi_kerja = $3' : ''}
      ${req.lokasiKerja && req.employeeId ? 'AND e.lokasi_kerja = $4' : ''}
      GROUP BY e.id, e.nip, e.nama, e.posisi, e.agama, e.lokasi_kerja, e.mulai_bergabung, e.created_at, e.updated_at
      ORDER BY e.nama
    `;

    const reportParams = [req.startDate, req.endDate];
    if (req.employeeId) reportParams.push(req.employeeId);
    if (req.lokasiKerja) reportParams.push(req.lokasiKerja);

    const results = await employeeDB.rawQueryAll<any>(query, ...reportParams);

    const reports: InvoiceReport[] = [];

    for (const result of results) {
      // Get detailed invoice records
      const invoiceQuery = `
        SELECT 
          id,
          invoice_number as "invoiceNumber",
          employee_id as "employeeId",
          amount,
          description,
          issue_date as "issueDate",
          due_date as "dueDate",
          status,
          paid_at as "paidAt",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM invoices
        WHERE employee_id = $1 AND issue_date >= $2 AND issue_date <= $3
        ORDER BY issue_date DESC
      `;

      const invoiceRecords = await employeeDB.rawQueryAll<any>(
        invoiceQuery,
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
        totalInvoices: parseInt(result.totalInvoices) || 0,
        totalAmount: parseFloat(result.totalAmount) || 0,
        paidAmount: parseFloat(result.paidAmount) || 0,
        pendingAmount: parseFloat(result.pendingAmount) || 0,
        invoiceRecords
      });
    }

    return { reports };
  }
);
