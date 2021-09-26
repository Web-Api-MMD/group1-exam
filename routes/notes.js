const express = require('express');
const router = express.Router();

const Note = require('../models/note');


router.get('/', async (req, res) => {
    let noteid;

    if (req.query.noteID) {
        noteid = parseInt(req.query.noteID);
        if (!noteid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?noteID= should refer an author id (integer)' }));
    }

    try {
        if (req.query.noteID) {
            const notes = await Note.readAll(noteid);
            return res.send(JSON.stringify(notes));
        } 
        else {
            const allNotes = await Note.readAll();
            return res.send(JSON.stringify(allNotes));
        }
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err + ' catch fra route handler' }));
    }
});



router.get('/:noteID', async (req, res) => {
    const { error } = Note.validate(req.params);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteid has to be an integer. If you are looking for a user add a userID, like "/userID"', errorDetail: error.details[0].message }));
    try {
        const note = await Note.readById(req.params.noteID);
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

router.get('/user/:userID', async (req, res) => {
    let userid;

    if (req.params.userID) {
        userid = parseInt(req.params.userID);
        if (!userid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?userID= should refer a userID and should be an integer' }));
    }

    try {
         if (req.params.userID) {
            const userNotes = await Note.readByUserId(userid);
            return res.send(JSON.stringify(userNotes));
        }
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err + ' catch fra route handler' }));
    }
});

router.post('/', async (req, res) => {
    try {
        const newNote = new Note(req.body);
        const note = await newNote.create();
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

router.delete('/:noteID', async (req, res) => {
    const { error } = Note.validate(req.params);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteid has to be an integer', errorDetail: error.details[0].message }));

    try {
        const note = await Note.delete(req.params.noteID);
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

router.put('/:noteID', async (req, res) => {
    const noteIDValidate = Note.validate(req.params);
    if (noteIDValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteID has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = Note.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: note payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldNote = await Note.readById(req.params.noteID);
        oldNote.copy(req.body);
        const note = await oldNote.update();
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

module.exports = router;