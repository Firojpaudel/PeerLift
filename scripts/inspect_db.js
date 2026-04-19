const { Client } = require('pg');

async function inspect() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log("--- NEON DATABASE AUDIT ---");
    
    // 1. List Tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log("\nTables Found:", tablesRes.rows.map(r => r.table_name).join(', '));

    // 2. Check Enums
    const enumsRes = await client.query(`
      SELECT t.typname AS enum_name, e.enumlabel AS enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
    `);
    console.log("\nEnums Found:");
    const enums = {};
    enumsRes.rows.forEach(r => {
      if (!enums[r.enum_name]) enums[r.enum_name] = [];
      enums[r.enum_name].push(r.enum_value);
    });
    console.log(JSON.stringify(enums, null, 2));

    // 3. Detailed Column Check for Key Tables
    const tablesToCheck = ['users', 'messages', 'user_skills', 'exchange_requests'];
    for (const table of tablesToCheck) {
      const colsRes = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY column_name
      `, [table]);
      console.log(`\nColumns for table "${table}":`);
      console.table(colsRes.rows);
    }

  } catch (err) {
    console.error("Audit Failed:", err);
  } finally {
    await client.end();
  }
}

inspect();
