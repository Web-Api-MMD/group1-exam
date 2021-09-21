const express = require('express');
const router = express.Router();

const Book = require('../models/book');
const Author = require('../models/author');


router.get('/', async (req, res) => {
console.log(req.query.authorid);
    // need to call the Book class for DB access...
    let authorid;
    if (req.query.authorid) {
        authorid = parseInt(req.query.authorid);
        if (!authorid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?author= should refer an author id (integer)' }));
    }

    try {
        const books = await Book.readAll(authorid);
        return res.send(JSON.stringify(books));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }

});

// router.get('/:bookid', async (req, res) => {
//     // › › validate req.params.bookid as bookid
//     // › › call await Book.readById(req.params.bookid)
//     const { error } = Book.validate(req.params);
//     if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: bookid has to be an integer', errorDetail: error.details[0].message }));

//     try {
//         const book = await Book.readById(req.params.bookid);
//         return res.send(JSON.stringify(book));
//     } catch (err) {
//         return res.status(500).send(JSON.stringify({ errorMessage: err }));
//     }
// });

// router.post('/', async (req, res) => {
//     // › › validate req.body (payload) as book --> authors must have authorid!
//     // › › instantiate book = new Book(req.body)
//     // › › call await book.create()

//     const { error } = Book.validate(req.body);
//     if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Book payload formatted incorrectly', errorDetail: error.details[0].message }));

//     try {
//         const newBook = new Book(req.body);
//         const book = await newBook.create();
//         return res.send(JSON.stringify(book));
//     } catch (err) {
//         return res.status(500).send(JSON.stringify({ errorMessage: err }));
//     }
// });

// router.delete('/:bookid', async (req, res) => {
//     // › › validate req.params.bookid as bookid
//     // › › call await Book.delete(req.params.bookid)
//     const { error } = Book.validate(req.params);
//     if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: bookid has to be an integer', errorDetail: error.details[0].message }));

//     try {
//         const book = await Book.delete(req.params.bookid);
//         return res.send(JSON.stringify(book));
//     } catch (err) {
//         return res.status(500).send(JSON.stringify({ errorMessage: err }));
//     }
// });

// router.put('/:bookid', async (req, res) => {
//     // › › validate req.params.bookid as bookid
//     // › › validate req.body (payload) as book --> authors must have authorid!
//     // › › call book = await Book.readById(req.params.bookid)
//     // › › merge / overwrite book object with req.body
//     // › › call await book.update() --> book holds the updated information
//     const bookidValidate = Book.validate(req.params);
//     if (bookidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: bookid has to be an integer', errorDetail: error.details[0].message }));

//     const payloadValidate = Book.validate(req.body);
//     if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Book payload formatted incorrectly', errorDetail: error.details[0].message }));

//     try {
//         const oldBook = await Book.readById(req.params.bookid);
//         oldBook.copy(req.body);
//         const book = await oldBook.update();
//         return res.send(JSON.stringify(book));
//     } catch (err) {
//         return res.status(500).send(JSON.stringify({ errorMessage: err }));
//     }
// });


module.exports = router;