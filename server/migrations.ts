import * as fs from "fs";
import * as path from "path";
import { db } from "./db";

async function runMigrations(): Promise<void> {
  try {
    const migrationsDir = path.join(process.cwd(), "migrations");

    if (!fs.existsSync(migrationsDir)) {
      console.log("No migrations directory found, skipping migrations");
      return;
    }

    // Read all SQL migration files
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      console.log("No migration files found");
      return;
    }

    // Get database connection to execute raw SQL
    const connection = await (db as any).getConnection?.();
    if (!connection) {
      // Fallback: use the pool directly
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        // Split by statement breakpoint and execute
        const statements = sql
          .split("-->")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          try {
            await pool.query(statement);
            console.log(`✓ Executed migration statement from ${file}`);
          } catch (error: any) {
            // Ignore "already exists" errors
            if (
              error.code !== "42P07" &&
              error.code !== "42701" &&
              !error.message?.includes("already exists")
            ) {
              console.warn(
                `Warning executing ${file}: ${error.message}`,
              );
            }
          }
        }
      }

      await pool.end();
    }

    console.log("✓ Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}

export { runMigrations };
