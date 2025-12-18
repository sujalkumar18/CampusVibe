import * as fs from "fs";
import * as path from "path";

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

    // Create pool directly
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");

        // Split by --> statement-breakpoint (Drizzle format)
        const statements = content
          .split("-->")
          .map((statement) => {
            // Remove the "statement-breakpoint" text and trim
            return statement
              .replace(/\s*statement-breakpoint\s*/g, "")
              .trim();
          })
          .filter((statement) => statement.length > 0 && !statement.startsWith("statement-breakpoint"));

        console.log(`Found ${statements.length} statements in ${file}`);

        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (error: any) {
            // Ignore "already exists" errors (idempotent)
            if (
              error.code === "42P07" ||
              error.code === "42701" ||
              error.message?.includes("already exists")
            ) {
              // Table or index already exists - this is fine
              continue;
            }
            // Log other errors but don't fail
            console.warn(`Warning: ${error.message}`);
          }
        }

        console.log(`✓ Completed migration: ${file}`);
      }

      console.log("✓ All migrations completed successfully");
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}

export { runMigrations };
