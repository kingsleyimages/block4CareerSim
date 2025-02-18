const pg = require('pg');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT || 'shhh';
const uuid = require('uuid');
const client = new pg.Client();
const bcrypt = require('bcrypt');

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS comments; 
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS books;
    DROP TABLE IF EXISTS users;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
    CREATE TABLE books(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      author VARCHAR(100) NOT NULL,
      genre VARCHAR(100) NOT NULL
    );
    CREATE TABLE reviews(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      book_id UUID REFERENCES books(id) NOT NULL,
      review TEXT NOT NULL,
      CONSTRAINT unique_user_id_book_id UNIQUE (user_id, book_id)
    );
    CREATE TABLE comments(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      review_id UUID REFERENCES reviews(id) NOT NULL,
      comment TEXT NOT NULL,
      CONSTRAINT unique_user_id_review_id UNIQUE (user_id, review_id)
    );
   
  `;
  await client.query(SQL);
};

module.exports = {
  client,
  createTables,
};
