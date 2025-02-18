require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());
const {
  client,
  createUser,
  fetchUserById,
  fetchUsers,

  isLoggedIn,
  authenticate,
  fetchBooks,
  fetchBookById,
  createBook,
} = require('./db');

// get a list of users
app.get('/api/user', async (req, res) => {
  try {
    const users = await fetchUsers();
    res.send(users);
  } catch (error) {
    next(error);
  }
});
// get a user by their id
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await fetchUserById(req.params.id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await createUser(req.body.username, req.body.password);
    res.status(201).send(user.id);
  } catch (error) {
    next(error);
  }
});

// login a user
app.post('/api/auth/login', async (req, res) => {
  try {
    res.send(await authenticate(req.body));
  } catch (error) {
    next(error);
  }
});

//get user dashboard/account
app.get('/api/user/me', isLoggedIn, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

// get a list of books

app.get('/api/books', async (req, res) => {
  try {
    const books = await fetchBooks();
    res.send(books);
  } catch (error) {
    next(error);
  }
});

// get a book by its id
app.get('/api/books/:id', async (req, res, next) => {
  try {
    const book = await fetchBookById(req.params.id);
    res.send(book);
  } catch (error) {
    next(error);
  }
});

// create a book entry
app.post('/api/books', async (req, res, next) => {
  try {
    const { name, author, genre } = req.body;
    const bookadded = await createBook(
      req.body.name,
      req.body.author,
      req.body.genre
    );
    res.status(201).send(bookadded);
  } catch (error) {
    next(error);
  }
});


const init = async () => {
  try {
    await client.connect();
    app.listen(3001, () => {
      console.log('Server is listening on port 3001');
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};
init();
