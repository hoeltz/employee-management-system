export interface Employee {
  id: number;
  nip: string;
  nama: string;
  posisi: string;
  agama: string;
  lokasiKerja: string;
  mulaiBergabung: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeRequest {
  nip: string;
  nama: string;
  posisi: string;
  agama: string;
  lokasiKerja: string;
  mulaiBergabung: Date;
}

export interface UpdateEmployeeRequest {
  id: number;
  nama?: string;
  posisi?: string;
  agama?: string;
  lokasiKerja?: string;
  mulaiBergabung?: Date;
}

export interface ListEmployeesRequest {
  limit?: number;
  offset?: number;
  lokasiKerja?: string;
  posisi?: string;
}

export interface ListEmployeesResponse {
  employees: Employee[];
  total: number;
}

export interface GetEmployeeRequest {
  id: number;
}

export interface BulkUploadRequest {
  employees: CreateEmployeeRequest[];
}

export interface BulkUploadResponse {
  success: number;
  failed: number;
  errors: string[];
}

export interface Attendance {
  id: number;
  employeeId: number;
  date: Date;
  checkIn?: string;
  checkOut?: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason?: string;
  status: string;
  approvedBy?: number;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  employeeId: number;
  amount: number;
  description?: string;
  issueDate: Date;
  dueDate: Date;
  status: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  employeeId?: number;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Setting {
  id: number;
  key: string;
  value?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  employeeId?: number;
}

export interface UpdateUserRequest {
  id: number;
  username?: string;
  email?: string;
  role?: string;
  employeeId?: number;
  isActive?: boolean;
}

export interface UpdateSettingRequest {
  key: string;
  value: string;
}

export interface ReportRequest {
  startDate: Date;
  endDate: Date;
  employeeId?: number;
  lokasiKerja?: string;
  format: 'json' | 'excel' | 'pdf';
}

export interface AttendanceReport {
  employee: Employee;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRecords: Attendance[];
}

export interface LeaveReport {
  employee: Employee;
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  leaveRecords: LeaveRequest[];
}

export interface InvoiceReport {
  employee: Employee;
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  invoiceRecords: Invoice[];
}
