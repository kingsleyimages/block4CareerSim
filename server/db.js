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

const createUser = async (username, password) => {
  try {
    const SQL = `
    INSERT INTO users (id, username, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
    const { rows } = await client.query(SQL, [
      uuid.v4(),
      username,
      await bcrypt.hash(password, 5),
    ]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const fetchUsers = async () => {
  try {
    const SQL = `
    SELECT id, username
    FROM users;
  `;
    const { rows } = await client.query(SQL);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const fetchUserById = async (id) => {
  try {
    const SQL = 'SELECT id, username FROM users WHERE id=$1;';
    const { rows } = await client.query(SQL, [id]);
    return rows;
  } catch (error) {
    console.error(error);
  }
};

const authenticate = async ({ username, password }) => {
  const SQL = `
    SELECT id, password
    FROM users
    WHERE username = $1
  `;
  const response = await client.query(SQL, [username]);
  // add in password check
  // use bcrypt compare against plain text password vs hashed password in data base
  if (
    // look to see if the response is empty or if the password does not match
    !response.rows.length ||
    (await bcrypt.compare(password, response.rows[0].password)) === false
  ) {
    // if no user or password does not match
    const error = Error('not authorized');
    return error;
  }
  // token is created and returned
  return jwt.sign({ id: response.rows[0].id }, secret);
};

const findUserByToken = async (token) => {
  console.log('TOKEN, ', token);
  let id;
  try {
    // backend is verifying the token by desconstructing the token with the secret: if theres and error it throws an error
    const payload = jwt.verify(token, secret);
    // if no errror get the id from the payload and set it to the id variable which will be used to query the database
    id = payload.id;
  } catch (error) {
    const err = Error('not authorized');
    err.status = 401;
    throw err;
  }
  // if the token is verified then it will return the user id
  const SQL = `
    SELECT id, username
    FROM users
    WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  if (!response.rows.length) {
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  return response.rows[0];
};
// custom middleware to find the user by token
const isLoggedIn = async (req, res, next) => {
  try {
    console.log('req.headers.authorization', req.headers);
    req.user = await findUserByToken(req.headers.authorization);
    next();
  } catch (ex) {
    next(ex);
  }
};

const createBook = async (name, author, genre) => {
  try {
    const SQL = `
      INSERT INTO books (id, name, author, genre)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await client.query(SQL, [uuid.v4(), name, author, genre]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};
const fetchBooks = async () => {
  try {
    const SQL = `
      SELECT id, name, author, genre
      FROM books;
    `;
    const { rows } = await client.query(SQL);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const fetchBookById = async (id) => {
  try {
    const SQL = `
      SELECT id, name, author, genre
      FROM books
      WHERE id = $1;
    `;
    const { rows } = await client.query(SQL, [id]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

// create a review entry
const createReview = async (user_id, book_id, review) => {
  try {
    const SQL = `
      INSERT INTO reviews (id, user_id, book_id, review)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await client.query(SQL, [
      uuid.v4(),
      user_id,
      book_id,
      review,
    ]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  client,
  createTables,
  createUser,
  fetchUsers,
  fetchUserById,
  authenticate,
  findUserByToken,
  isLoggedIn,
  createBook,
  fetchBooks,
  fetchBookById,
  createBook,
  createReview,
};
