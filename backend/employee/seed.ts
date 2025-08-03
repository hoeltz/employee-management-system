import { api } from "encore.dev/api";
import { employeeDB } from "./db";

interface SeedResponse {
  message: string;
  count: number;
}

// Seeds the database with initial employee data.
export const seed = api<void, SeedResponse>(
  { expose: true, method: "POST", path: "/employees/seed" },
  async () => {
    const employees = [
      { nip: "68190007", nama: "KOK HAI", posisi: "FO Leader", agama: "Buddha", lokasiKerja: "PS", mulaiBergabung: "2019-05-01" },
      { nip: "84190008", nama: "JIMMI ANDRE MARK MANIK", posisi: "Jointer", agama: "Kristen", lokasiKerja: "PS", mulaiBergabung: "2019-05-01" },
      { nip: "90200055", nama: "RICI AFRIYADI", posisi: "Field Enggeneer", agama: "Islam", lokasiKerja: "TGR", mulaiBergabung: "2020-06-26" },
      { nip: "01210104", nama: "WAHYU ADITYA ANANDA", posisi: "Field Enggeneer", agama: "Islam", lokasiKerja: "MDN", mulaiBergabung: "2021-07-01" },
      { nip: "82210116", nama: "DIONESIUS HOKBIBIN BERUTU", posisi: "Field Enggeneer", agama: "Kristen", lokasiKerja: "PS", mulaiBergabung: "2021-09-20" },
      { nip: "96210124", nama: "KUSNADI", posisi: "Jointer", agama: "Islam", lokasiKerja: "TGR", mulaiBergabung: "2021-11-26" },
      { nip: "00220142", nama: "AYEIN MAULANA", posisi: "General Administration", agama: "Islam", lokasiKerja: "MDN", mulaiBergabung: "2022-06-15" },
      { nip: "01220144", nama: "SOPIAN HADI", posisi: "Field Enggeneer", agama: "Islam", lokasiKerja: "BKS", mulaiBergabung: "2022-06-26" },
      { nip: "99220147", nama: "FIRMAN RAHMADANI", posisi: "Jointer", agama: "Islam", lokasiKerja: "BKS", mulaiBergabung: "2022-07-05" },
      { nip: "89220152", nama: "IMAM KHOLIDIN", posisi: "FO Leader", agama: "Islam", lokasiKerja: "TGR", mulaiBergabung: "2022-09-19" },
      { nip: "88220154", nama: "ZAINUR ROHMAN", posisi: "FO Leader", agama: "Islam", lokasiKerja: "BKS", mulaiBergabung: "2022-10-03" },
      { nip: "92230160", nama: "ANGGER", posisi: "Field Enggeneer", agama: "Islam", lokasiKerja: "PS", mulaiBergabung: "2023-01-09" },
      { nip: "85230162", nama: "RIZA RIA WIRASARI", posisi: "General Administration", agama: "Islam", lokasiKerja: "MDN", mulaiBergabung: "2023-03-03" },
      { nip: "02230171", nama: "BENTENG DANDI SAPUTRA", posisi: "Field Enggeneer", agama: "Islam", lokasiKerja: "BKS", mulaiBergabung: "2023-06-05" },
      { nip: "73240183", nama: "IMAM WAHYUDI", posisi: "Operational General Manager", agama: "Islam", lokasiKerja: "TGR", mulaiBergabung: "2024-04-01" },
      { nip: "05240194", nama: "DIMAS ADE SAPUTRA", posisi: "Field Enggeneer", agama: "Islam", lokasiKerja: "BKS", mulaiBergabung: "2024-08-12" },
      { nip: "01240195", nama: "ANDRE IRFAN SAPUTRA", posisi: "Field Enggeneer", agama: "Islam", lokasiKerja: "TGR", mulaiBergabung: "2024-09-21" }
    ];

    // Clear existing data
    await employeeDB.exec`DELETE FROM employees`;

    // Insert new data
    for (const emp of employees) {
      await employeeDB.exec`
        INSERT INTO employees (nip, nama, posisi, agama, lokasi_kerja, mulai_bergabung)
        VALUES (${emp.nip}, ${emp.nama}, ${emp.posisi}, ${emp.agama}, ${emp.lokasiKerja}, ${emp.mulaiBergabung})
      `;
    }

    return {
      message: "Database seeded successfully",
      count: employees.length
    };
  }
);
