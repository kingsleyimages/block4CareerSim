require('dotenv').config();
const {
  client,
  createTables,
  createUser,
  createBook,
  createReview,
} = require('./db');
const seed = async () => {
  try {
    await client.connect();
    console.log('connected to database');
    await createTables();
    const [moe, larry, curly, professor, maryann, ginger, gilligan] =
      await Promise.all([
        createUser('moe', 'password'),
        createUser('larry', 'password'),
        createUser('curly', 'password'),
        createUser('professor', 'password'),
        createUser('maryann', 'password'),
        createUser('ginger', 'password'),
        createUser('gilligan', 'password'),
      ]);
    const [orwell, cryptonomicon, osus, af, farenheit, robin, greenlights] =
      await Promise.all([
        createBook('1984', 'George Orwell', 'fiction'),
        createBook('Crytonomicon', 'Neal Stephenson', 'fiction'),
        createBook('Over Sea, Under Stone', 'Susan Cooper', 'fiction'),
        createBook('Animal Farm', 'George Orwell', 'fiction'),
        createBook('Farenheit 451', 'Ray Bradbury', 'fiction'),
        createBook('Robin', 'Dave Itzkoff', 'non-fiction'),
        createBook('Greenlights', 'Matthew McConaughey', 'non-fiction'),
      ]);

    const [review1, review2, review3, review4, review5, review6, review7] =
      await Promise.all([
        createReview(moe[0].id, greenlights[0].id, 'meh'),
        createReview(ginger[0].id, cryptonomicon[0].id, 'fiction'),
        createReview(gilligan[0].id, osus[0].id, 'great!'),
        createReview(larry[0].id, orwell[0].id, 'scary'),
        createReview(curly[0].id, farenheit[0].id, 'classic'),
        createReview(
          professor[0].id,
          robin[0].id,
          'Robin Williams was a genius'
        ),
        createReview(maryann[0].id, af[0].id, 'too close to home'),
      ]);
    console.log('sample data inserted');
  } catch (error) {
    console.error('Error seeding data: ', error);
  } finally {
    await client.end();
  }
};
seed();
