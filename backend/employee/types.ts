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
