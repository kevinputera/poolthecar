const { promises } = require('fs');
const { join } = require('path');
const { getClient } = require('../db');
const { initTestData } = require('./testData');

const SCHEMA_DIR = join(__dirname, 'schema.sql');

async function createTables() {
  const createTableString = (await promises.readFile(SCHEMA_DIR)).toString();
  const client = await getClient();
  await client.query(createTableString);
  await initTestData();
}

createTables()
  .then(() => {
    console.log('Tables created!');
    process.exit(0);
  })
  .catch(error => {
    console.log('Table creation failed:', error);
    process.exit(1);
  });

module.exports = { createTables };
