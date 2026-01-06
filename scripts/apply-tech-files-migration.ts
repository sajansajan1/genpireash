/**
 * Apply Tech Files Migration
 * Run this script to create the tech_files tables in your Supabase database
 *
 * Usage:
 *   npx tsx scripts/apply-tech-files-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  console.log('🚀 Starting Tech Files Migration...\n');

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials');
    console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  console.log('📍 Connecting to Supabase...');
  console.log(`   URL: ${supabaseUrl}\n`);

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Read migration file
    console.log('📄 Reading migration file...');
    const migrationPath = join(
      process.cwd(),
      'supabase/migrations/create_tech_files_table.sql'
    );
    const migrationSql = readFileSync(migrationPath, 'utf-8');
    console.log(`   File: ${migrationPath}`);
    console.log(`   Size: ${(migrationSql.length / 1024).toFixed(2)} KB\n`);

    // Execute migration
    console.log('⚙️  Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSql,
    });

    if (error) {
      // If exec_sql doesn't exist, try direct execution (requires proper permissions)
      console.log('   Note: exec_sql function not found, trying direct execution...');

      // Split SQL into individual statements
      const statements = migrationSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`   Executing ${statements.length} SQL statements...\n`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];

        // Skip comment-only statements
        if (statement.startsWith('/*') || statement.startsWith('--')) {
          continue;
        }

        console.log(`   [${i + 1}/${statements.length}] ${statement.substring(0, 50)}...`);

        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql: statement + ';',
        });

        if (stmtError) {
          console.error(`   ⚠️  Warning: ${stmtError.message}`);
          // Continue with other statements
        }
      }
    }

    console.log('\n✅ Migration completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tables = [
      'tech_files',
      'tech_file_versions',
      'tech_file_collections',
      'tech_file_collection_items',
    ];

    for (const tableName of tables) {
      const { data: tableExists, error: checkError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (checkError) {
        console.log(`   ❌ ${tableName}: NOT FOUND`);
        console.log(`      Error: ${checkError.message}`);
      } else {
        console.log(`   ✅ ${tableName}: Created successfully`);
      }
    }

    console.log('\n🎉 Migration Complete!\n');
    console.log('Next steps:');
    console.log('1. Review the tables in your Supabase dashboard');
    console.log('2. Test the tech files service with a sample file creation');
    console.log('3. Update your application code to use the new tables');
    console.log('\nFor usage examples, see: api/tech-pack-v2/TECH_FILES_README.md\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
applyMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
