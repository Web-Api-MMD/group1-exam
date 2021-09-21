const express = require('express');
const router = express.Router();

const Note = require('../models/note');
//const Author = require('../models/author');


router.get('/', async (req, res) => {
    // need to call the Note class for DB access...
    // console.log(req.query);

    // let userid;
    // if (req.query.userid) {
    //     userid = parseInt(req.query.userid);
    //     if (!userid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?author= should refer an author id (integer)' }));
    // }

    // try {
    //     const notes = await Note.readAll(userid);
    //     return res.send(JSON.stringify(notes));
    // } catch (err) {
    //     return res.status(500).send(JSON.stringify({ errorMessage: err }));
    // }
    res.send('Notes root');
});

router.get('/:noteid', async (req, res) => {
    // › › validate req.params.noteid as noteid
    // › › call await note.readById(req.params.noteid)
    const { error } = Note.validate(req.params);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteid has to be an integer', errorDetail: error.details[0].message }));

    try {
        const note = await Note.readById(req.params.noteid);
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

router.post('/', async (req, res) => {
    // › › validate req.body (payload) as note --> authors must have authorid!
    // › › instantiate note = new note(req.body)
    // › › call await note.create()

    const { error } = Note.validate(req.body);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: note payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const newNote = new Note(req.body);
        const note = await newNote.create();
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

router.delete('/:noteid', async (req, res) => {
    // › › validate req.params.noteid as noteid
    // › › call await note.delete(req.params.noteid)
    const { error } = Note.validate(req.params);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteid has to be an integer', errorDetail: error.details[0].message }));

    try {
        const note = await Note.delete(req.params.noteid);
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

router.put('/:noteid', async (req, res) => {
    // › › validate req.params.noteid as noteid
    // › › validate req.body (payload) as note --> authors must have authorid!
    // › › call note = await note.readById(req.params.noteid)
    // › › merge / overwrite note object with req.body
    // › › call await note.update() --> note holds the updated information
    const noteidValidate = Note.validate(req.params);
    if (noteidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = Note.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: note payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldNote = await Note.readById(req.params.noteid);
        oldNote.copy(req.body);
        const note = await oldNote.update();
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});


module.exports = router;