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
/*
//
//
//   users
//
//
*/
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
  console.log('response.rows[0]', response.rows[0]);
  return response.rows[0];
};
// custom middleware to find the user by token
const isLoggedIn = async (req, res, next) => {
  try {
    // console.log('req.headers.authorization', req.headers);
    req.user = await findUserByToken(req.headers.authorization);
    next();
  } catch (ex) {
    next(ex);
  }
};

/*
//
//
//   books
//
//
*/

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

/*
//
//
//   reviews
//
//
*/

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

const fetchReviewByBookId = async (id) => {
  try {
    const SQL = `
      SELECT user_id, book_id, review
      FROM reviews
      WHERE book_id = $1;
    `;
    const { rows } = await client.query(SQL, [id]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const fetchReviewByReviewUserId = async (bookId, reviewId) => {
  try {
    const SQL = `
      SELECT user_id, book_id, id, review
      FROM reviews
      WHERE id = $1 AND book_id = $2;
    `;
    const { rows } = await client.query(SQL, [reviewId, bookId]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};
const fetchReviewByUserId = async (id) => {
  try {
    const SQL = `
      SELECT user_id, id, review
      FROM reviews
      WHERE user_id = $1;
    `;
    const { rows } = await client.query(SQL, [id]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const updateReview = async (userId, id, review) => {
  try {
    const SQL = `
      UPDATE reviews
      SET review = $3
      WHERE id = $2 AND user_id = $1
      RETURNING *;
    `;
    const { rows } = await client.query(SQL, [userId, id, review]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const deleteReview = async (userId, id) => {
  try {
    const SQL = `
      DELETE FROM reviews
      WHERE id = $2 AND user_id = $1
      RETURNING *;
    `;
    const { rows } = await client.query(SQL, [userId, id]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

/*
//
//
//   comments
//
//
*/

const createComment = async (user_id, review_id, comment) => {
  try {
    const SQL = `
      INSERT INTO comments (id, user_id, review_id, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await client.query(SQL, [
      uuid.v4(),
      user_id,
      review_id,
      comment,
    ]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const fetchCommentByUserId = async (id) => {
  try {
    const SQL = `
      SELECT user_id, review_id, comment
      FROM comments
      WHERE user_id = $1;
    `;
    const { rows } = await client.query(SQL, [id]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

// update comment

const updateComment = async (userId, id, comment) => {
  try {
    const SQL = `
      UPDATE comments
      SET comment = $1
      WHERE id = $2 and user_id = $3
      RETURNING *;
    `;
    const { rows } = await client.query(SQL, [comment, id, userId]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const deleteComment = async (userId, id) => {
  try {
    const SQL = `
      DELETE FROM comments
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const { rows } = await client.query(SQL, [id, userId]);
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
  createComment,
  fetchCommentByUserId,
  fetchReviewByBookId,
  fetchReviewByReviewUserId,
  fetchReviewByUserId,
  updateReview,
  updateComment,
  deleteComment,
  deleteReview,
};
