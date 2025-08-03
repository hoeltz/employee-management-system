import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { CreateUserRequest, UpdateUserRequest, User } from "../employee/types";

const employeeDB = SQLDatabase.named("employee");

// Lists all users.
export const listUsers = api<void, { users: User[] }>(
  { expose: true, method: "GET", path: "/admin/users" },
  async () => {
    const users = await employeeDB.queryAll<User>`
      SELECT 
        id,
        username,
        email,
        role,
        employee_id as "employeeId",
        is_active as "isActive",
        last_login as "lastLogin",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      ORDER BY created_at DESC
    `;

    return { users };
  }
);

// Creates a new user.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/admin/users" },
  async (req) => {
    // Check if username or email already exists
    const existing = await employeeDB.queryRow`
      SELECT id FROM users WHERE username = ${req.username} OR email = ${req.email}
    `;

    if (existing) {
      throw APIError.alreadyExists("username or email already exists");
    }

    // Hash password (in real implementation, use proper password hashing)
    const passwordHash = Buffer.from(req.password).toString('base64');

    const user = await employeeDB.queryRow<User>`
      INSERT INTO users (username, email, password_hash, role, employee_id)
      VALUES (${req.username}, ${req.email}, ${passwordHash}, ${req.role}, ${req.employeeId})
      RETURNING 
        id,
        username,
        email,
        role,
        employee_id as "employeeId",
        is_active as "isActive",
        last_login as "lastLogin",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    if (!user) {
      throw APIError.internal("failed to create user");
    }

    return user;
  }
);

// Updates a user.
export const updateUser = api<UpdateUserRequest, User>(
  { expose: true, method: "PUT", path: "/admin/users/:id" },
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.username !== undefined) {
      updates.push(`username = $${paramIndex}`);
      params.push(req.username);
      paramIndex++;
    }

    if (req.email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      params.push(req.email);
      paramIndex++;
    }

    if (req.role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      params.push(req.role);
      paramIndex++;
    }

    if (req.employeeId !== undefined) {
      updates.push(`employee_id = $${paramIndex}`);
      params.push(req.employeeId);
      paramIndex++;
    }

    if (req.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(req.isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.id);

    const query = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        username,
        email,
        role,
        employee_id as "employeeId",
        is_active as "isActive",
        last_login as "lastLogin",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const user = await employeeDB.rawQueryRow<User>(query, ...params);

    if (!user) {
      throw APIError.notFound("user not found");
    }

    return user;
  }
);

// Deletes a user.
export const deleteUser = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/admin/users/:id" },
  async (req) => {
    const result = await employeeDB.queryRow<{ count: number }>`
      DELETE FROM users 
      WHERE id = ${req.id}
      RETURNING 1 as count
    `;

    if (!result) {
      throw APIError.notFound("user not found");
    }
  }
);
