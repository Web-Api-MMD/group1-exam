const express = require('express');
const router = express.Router();

const Note = require('../models/note');


router.get('/', async (req, res) => {
    // need to call the Book class for DB access...
    let noteid;
    // let userid;
    console.log(req.query.noteID);
    if (req.query.noteID) {
        noteid = parseInt(req.query.noteID);
        console.log(noteid + ' noteid fra route handler');
        if (!noteid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?noteID= should refer an author id (integer)' }));
    }
    // else if (req.query.userID) {
    //     userid = parseInt(req.query.userID);
    //     console.log(userid + ' userid fra route handler');
    //     if (!userid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?userID= should refer an author id (integer)' }));
    // }

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
    // › › validate req.params.noteid as noteid
    // › › call await note.readById(req.params.noteid)

    const { error } = Note.validate(req.params);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteid has to be an integer', errorDetail: error.details[0].message }));
    try {
        const note = await Note.readById(req.params.noteID);
        return res.send(JSON.stringify(note));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});


// WORKING
router.get('/user/:userID', async (req, res) => {
    // need to call the Book class for DB access...
    let userid;
    console.log(req.params.userID + ' paraaammmss');

    if (req.params.userID) {
        userid = parseInt(req.params.userID);
        // console.log(userid + ' userid fra route handler');
        if (!userid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?userID= should refer an author id (integer)' }));
    }

    try {
         if (req.params.userID) {
            const userNotes = await Note.readByUserId(userid);
            console.log(req.params.userID + ' hej ok');
            return res.send(JSON.stringify(userNotes));
        }
    } catch (err) {
        console.log(err + ' error fra handler');
        return res.status(500).send(JSON.stringify({ errorMessage: err + ' catch fra route handler' }));
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

// router.delete('/:noteid', async (req, res) => {
//     // › › validate req.params.noteid as noteid
//     // › › call await note.delete(req.params.noteid)
//     const { error } = Note.validate(req.params);
//     if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteid has to be an integer', errorDetail: error.details[0].message }));

//     try {
//         const note = await Note.delete(req.params.noteid);
//         return res.send(JSON.stringify(note));
//     } catch (err) {
//         return res.status(500).send(JSON.stringify({ errorMessage: err }));
//     }
// });

// router.put('/:noteid', async (req, res) => {
//     // › › validate req.params.noteid as noteid
//     // › › validate req.body (payload) as note --> authors must have authorid!
//     // › › call note = await note.readById(req.params.noteid)
//     // › › merge / overwrite note object with req.body
//     // › › call await note.update() --> note holds the updated information
//     const noteidValidate = Note.validate(req.params);
//     if (noteidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: noteid has to be an integer', errorDetail: error.details[0].message }));

//     const payloadValidate = Note.validate(req.body);
//     if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: note payload formatted incorrectly', errorDetail: error.details[0].message }));

//     try {
//         const oldNote = await Note.readById(req.params.noteid);
//         oldNote.copy(req.body);
//         const note = await oldNote.update();
//         return res.send(JSON.stringify(note));
//     } catch (err) {
//         return res.status(500).send(JSON.stringify({ errorMessage: err }));
//     }
// });

module.exports = router;