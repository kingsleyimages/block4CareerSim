require('dotenv').config();
const { client, createTables } = require('./db');
const seed = async () => {
  try {
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('sample data inserted');
  } catch (error) {
    console.error('Error seeding data: ', error);
  } finally {
    await client.end();
  }
};
seed();
