require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_KEY must be defined in your environment or .env file.");
  process.exit(1);
}

const ws = require('ws');
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: ws
  }
});

const METADATA_PATH = path.resolve(__dirname, '..', 'scratch', 'metadata.json');
const USERS_PATH = path.resolve(__dirname, '..', 'scratch', 'users.json');

async function migrate() {
  console.log("Starting migration to Supabase...");

  // 1. Migrate Users
  if (fs.existsSync(USERS_PATH)) {
    try {
      const usersData = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
      console.log(`Found ${usersData.length} users in local file.`);
      
      const dbUsers = usersData.map(u => ({
        email: u.email,
        password: u.password,
        role: u.role,
        assigned_person: u.assignedPerson || ''
      }));

      const { error: userError } = await supabase.from('users').upsert(dbUsers);
      if (userError) {
        console.error("Error uploading users:", userError);
      } else {
        console.log("Successfully uploaded users to Supabase!");
      }
    } catch (err) {
      console.error("Failed to parse/upload users:", err);
    }
  } else {
    console.log("No local users file found to migrate.");
  }

  // 2. Migrate File Metadata
  if (fs.existsSync(METADATA_PATH)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
      const items = Object.values(metadata);
      console.log(`Found ${items.length} file metadata records in local file.`);

      const dbItems = items.map(item => ({
        rel_path: item.relPath,
        status: item.status || 'Todo',
        notes: item.notes || '',
        tags: item.tags || []
      }));

      // Chunk uploads to avoid payload limit issues
      const chunkSize = 100;
      for (let i = 0; i < dbItems.length; i += chunkSize) {
        const chunk = dbItems.slice(i, i + chunkSize);
        const { error: metaError } = await supabase.from('file_metadata').upsert(chunk);
        if (metaError) {
          console.error(`Error uploading file metadata chunk ${i}-${i + chunk.length}:`, metaError);
        } else {
          console.log(`Uploaded chunk ${i + 1} to ${Math.min(i + chunkSize, dbItems.length)} metadata records.`);
        }
      }
      console.log("Successfully uploaded all metadata to Supabase!");
    } catch (err) {
      console.error("Failed to parse/upload metadata:", err);
    }
  } else {
    console.log("No local metadata file found to migrate.");
  }

  console.log("Migration complete!");
}

migrate();
