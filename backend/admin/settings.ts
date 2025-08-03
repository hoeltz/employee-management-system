import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Setting, UpdateSettingRequest } from "../employee/types";

const employeeDB = SQLDatabase.named("employee");

// Lists all settings.
export const listSettings = api<void, { settings: Setting[] }>(
  { expose: true, method: "GET", path: "/admin/settings" },
  async () => {
    const settings = await employeeDB.queryAll<Setting>`
      SELECT 
        id,
        key,
        value,
        description,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM settings
      ORDER BY key
    `;

    return { settings };
  }
);

// Updates a setting.
export const updateSetting = api<UpdateSettingRequest, Setting>(
  { expose: true, method: "PUT", path: "/admin/settings/:key" },
  async (req) => {
    const setting = await employeeDB.queryRow<Setting>`
      UPDATE settings 
      SET value = ${req.value}, updated_at = CURRENT_TIMESTAMP
      WHERE key = ${req.key}
      RETURNING 
        id,
        key,
        value,
        description,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    if (!setting) {
      // Create new setting if it doesn't exist
      const newSetting = await employeeDB.queryRow<Setting>`
        INSERT INTO settings (key, value)
        VALUES (${req.key}, ${req.value})
        RETURNING 
          id,
          key,
          value,
          description,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;

      if (!newSetting) {
        throw APIError.internal("failed to create setting");
      }

      return newSetting;
    }

    return setting;
  }
);

// Gets a specific setting by key.
export const getSetting = api<{ key: string }, Setting>(
  { expose: true, method: "GET", path: "/admin/settings/:key" },
  async (req) => {
    const setting = await employeeDB.queryRow<Setting>`
      SELECT 
        id,
        key,
        value,
        description,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM settings
      WHERE key = ${req.key}
    `;

    if (!setting) {
      throw APIError.notFound("setting not found");
    }

    return setting;
  }
);
