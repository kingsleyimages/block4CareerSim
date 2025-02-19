require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());
const {
  client,
  createUser,
  fetchUserById,
  fetchUsers,
  createComment,
  findUserByToken,
  isLoggedIn,
  authenticate,
  fetchBooks,
  fetchBookById,
  createBook,
  fetchCommentByUserId,
  fetchReviewByBookId,
  fetchReviewByReviewUserId,
  fetchReviewByUserId,
  createReview,
  updateComment,
  updateReview,
  deleteReview,
  deleteComment,
} = require('./db');

// createComment(
//   '9c174791-9388-472f-b21b-85cac4ad41ca',
//   '24f1ee31-4b27-4f29-af1d-edf9c7d854b0',
//   'balderdash'
// );

// createReview(
//   '9c174791-9388-472f-b21b-85cac4ad41ca',
//   'd67edfc4-8eeb-4202-aacd-1c8d492ccef8',
//   'spledid'
// );

/*
//
//
//   User Routes
//
//
//
*/

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
app.post('/api/auth/register', async (req, res, next) => {
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

/*
//
//
//   Book Routes
//
//
//
*/

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

/*
//
//
//   Review Routes
//
//
//
*/

//get reviews by book id

app.get('/api/books/:id/reviews', async (req, res) => {
  try {
    const reviews = await fetchReviewByBookId(req.params.id);
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

// get reviews by user id and review id

app.get(
  '/api/books/:bookId/reviews/:reviewId',

  isLoggedIn,
  async (req, res, next) => {
    try {
      const reviews = await fetchReviewByReviewUserId(
        req.params.bookId,
        req.params.reviewId
      );

      res.send(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      next(error);
    }
  }
);

//get reviews by user id

app.get('/api/reviews/me', isLoggedIn, async (req, res, next) => {
  try {
    console.log('Fetching reviews for user:', req.user.id);

    // console.log('Comments fetched:', comments);
    res.send(await fetchReviewByUserId(req.user.id));
    console.log('comment fetched');
  } catch (error) {
    console.error('Error fetching comments:', error);
    next(error);
  }
});

//post a review
app.post('/api/books/:bookId/reviews', isLoggedIn, async (req, res, next) => {
  try {
    const reviewadded = await createReview(
      req.user.id,
      req.params.bookId,
      req.body.review
    );
    res.status(201).send(reviewadded);
  } catch (error) {
    next(error);
  }
});

//update a review

app.patch(
  '/api/users/:userId/reviews/:reviewId',
  isLoggedIn,
  async (req, res, next) => {
    try {
      const review = await updateReview(
        req.params.userId,
        req.params.reviewId,
        req.body.review
      );
      res.send(review);
    } catch (error) {
      next(error);
    }
  }
);

//delete review
app.delete(
  '/api/users/:userId/reviews/:reviewId',
  isLoggedIn,
  async (req, res, next) => {
    try {
      const review = await deleteReview(req.params.userId, req.params.reviewId);
      res.send(review);
    } catch (error) {
      next(error);
    }
  }
);

/*
//
//
//   comment Routes
//
//
//
*/
// update a comment
app.patch(
  `/api/users/:userId/comments/:commentId`,
  isLoggedIn,
  async (req, res, next) => {
    try {
      const comment = await updateComment(
        req.params.userId,
        req.params.commentId,
        req.body.comment
      );
      res.send(comment);
    } catch (error) {
      next(error);
    }
  }
);

//get comments by user id

app.get('/api/comments/me', isLoggedIn, async (req, res, next) => {
  try {
    console.log('Fetching comments for user:', req.user.id);

    // console.log('Comments fetched:', comments);
    res.send(await fetchCommentByUserId(req.user.id));
    console.log('comment fetched');
  } catch (error) {
    console.error('Error fetching comments:', error);
    next(error);
  }
});

// delete comment

app.delete(
  '/api/users/:userId/comments/:commentId',
  isLoggedIn,
  async (req, res, next) => {
    try {
      const comment = await deleteComment(
        req.params.userId,
        req.params.commentId
      );
      res.send(comment);
    } catch (error) {
      next(error);
    }
  }
);

// post comment

app.post(
  '/api/users/:userId/reviews/:reviewId/comments',
  isLoggedIn,
  async (req, res, next) => {
    try {
      const comment = await createComment(
        req.params.userId,
        req.params.reviewId,
        req.body.comment
      );
      res.send(comment);
    } catch (error) {
      next(error);
    }
  }
);

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
