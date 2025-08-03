import { api, APIError } from "encore.dev/api";
import { employeeDB } from "./db";

interface DeleteEmployeeRequest {
  id: number;
}

// Deletes an employee record.
export const deleteEmployee = api<DeleteEmployeeRequest, void>(
  { expose: true, method: "DELETE", path: "/employees/:id" },
  async (req) => {
    const result = await employeeDB.queryRow<{ count: number }>`
      DELETE FROM employees 
      WHERE id = ${req.id}
      RETURNING 1 as count
    `;
    
    if (!result) {
      throw APIError.notFound("employee not found");
    }
  }
);
