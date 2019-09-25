const { Pool } = require('pg');
const { join } = require('path');

// Load env variables
require('dotenv').config({ path: join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: +process.env.POSTGRES_PORT,
});

async function getClient() {
  return await pool.connect();
}

module.exports = { getClient };
