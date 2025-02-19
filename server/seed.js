require('dotenv').config();
const {
  client,
  createTables,
  createUser,
  createBook,
  createReview,
  createComment,
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

    const [
      review1,
      review2,
      review3,
      review4,
      review5,
      review6,
      review7,
      review8,
    ] = await Promise.all([
      createReview(moe[0].id, greenlights[0].id, 'meh'),
      createReview(moe[0].id, cryptonomicon[0].id, 'amazing'),
      createReview(ginger[0].id, cryptonomicon[0].id, 'awesome'),
      createReview(gilligan[0].id, osus[0].id, 'great!'),
      createReview(larry[0].id, orwell[0].id, 'scary'),
      createReview(curly[0].id, farenheit[0].id, 'classic'),
      createReview(professor[0].id, robin[0].id, 'Robin Williams was a genius'),
      createReview(maryann[0].id, af[0].id, 'too close to home'),
    ]);

    const [
      comment1,
      comment2,
      comment3,
      comment4,
      comment5,
      comment6,
      comment7,
      comment8,
      comment9,
      comment10,
    ] = await Promise.all([
      createComment(moe[0].id, review6[0].id, 'comment1'),
      createComment(moe[0].id, review1[0].id, 'comment2'),
      createComment(ginger[0].id, review4[0].id, 'comment3'),
      createComment(gilligan[0].id, review2[0].id, 'comment4'),
      createComment(larry[0].id, review3[0].id, 'comment5'),
      createComment(curly[0].id, review5[0].id, 'comment6'),
      createComment(maryann[0].id, review5[0].id, 'comment10'),
      createComment(professor[0].id, review7[0].id, 'comment7'),
      createComment(maryann[0].id, review8[0].id, 'comment8'),
      createComment(professor[0].id, review5[0].id, 'comment9'),
      createComment("9c174791-9388-472f-b21b-85cac4ad41ca", review5[0].id, 'comment11'),
    ]);

    console.log('sample data inserted');
  } catch (error) {
    console.error('Error seeding data: ', error);
  } finally {
    await client.end();
  }
};
seed();
