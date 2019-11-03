const { promises } = require('fs');
const { join } = require('path');
const { makeSingleQuery } = require('../db');

const SCHEMA_DIR = join(__dirname, 'schema.sql');

const createTables = async () => {
  const createTableString = (await promises.readFile(SCHEMA_DIR)).toString();
  await makeSingleQuery(createTableString);
};

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
