const config = require('config');

const sql = require('mssql');
const con = config.get('dbConfig_UCN');

const Joi = require('joi');

const _ = require('lodash');

const Category = require('./category');

class Note {
    constructor(noteObj) {
        this.noteID = noteObj.noteID;
        this.noteName = noteObj.noteName;
        this.noteContent = noteObj.noteContent;
        this.noteCategory = noteObj.noteCategory;
        this.noteAuthor = noteObj.noteAuthor;
    }

    static validate(validateNoteObj) {
        const schema = Joi.object({
            noteID: Joi.number()
                .integer()
                .min(1),
            noteName: Joi.string()
                .min(1)
                .max(50),
                // .required(),
            noteContent: Joi.string()
                .min(1)
                .max(4000), // NvarChar(MAX) is 4000 characters
            noteCategory: Joi.object({
                    categoryID: Joi.number()
                    .integer()
                    .min(1)
                    .required(),
                    categoryName: Joi.string()
                    .min(1)
                    .max(50)
                    }
            ),
            noteAuthor: Joi.number()
                .integer()
                .min(1)
        });

        return schema.validate(validateNoteObj);
    }

    static readAll(noteid) {
        return new Promise((resolve, reject) => {
            (async () => {
                // › › connect to DB
                // › › create SQL query string (SELECT Book JOIN BookAuthor JOIN Author)
                // › › if authorid, add WHERE authorid to query string
                // › › query DB with query string
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                // DISCLAIMER: need to look up how to SELECT with the results of another SELECT
                //      right now only the author with the authorid is listed on the book in the response

                try {

                    const pool = await sql.connect(con);
                    let result;
                    if (noteid) {
                        result = await pool.request()
                            .input('noteID', sql.Int(), noteid)
                            .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_categoryID, n.FK_userID, c.categoryName
                            FROM cnNote n
                            JOIN cnCategory c ON c.categoryID = n.FK_categoryID
                            WHERE n.noteID = @noteID
                            `);
                    } else {
                        result = await pool.request()
                            .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_categoryID, n.FK_userID, c.categoryName
                            FROM cnNote n
                            JOIN cnCategory c ON c.categoryID = n.FK_categoryID
                            `);
                    };
                    
                    const notes = [];
                    let lastNoteIndex = -1;
                    result.recordset.forEach(record => {
                        if (notes.noteid) {
                            console.log(`Note with id ${record.noteID} already exists.`);
                            const newNote = {
                                noteID: record.noteID,
                                noteName: record.noteName,
                                noteContent: record.noteContent,
                                noteAuthor: record.FK_userID,
                                noteCategory: {
                                    categoryID: record.FK_categoryID,
                                    categoryName: record.categoryName
                                }
                            }
                            notesByUserID.push(newNote);
                            lastNoteIndex++;
                        } else {
                            console.log(`Note with id ${record.noteID} is a new note.`);
                            console.log(JSON.stringify(record.FK_userID) + ' = record');
                            const newNote = {
                                noteID: record.noteID,
                                noteName: record.noteName,
                                noteContent: record.noteContent,
                                noteAuthor: record.FK_userID,
                                noteCategory: {
                                    categoryID: record.FK_categoryID,
                                    categoryName: record.categoryName
                                }
                            }
                            notes.push(newNote);
                            lastNoteIndex++;
                        }
                    });

                    const validNotes = [];
                    notes.forEach(note => {
                        const { error } = Note.validate(note);
                        if (error) throw { errorMessage: `Note.validate failed.` };
                        validNotes.push(new Note(note));
                    });
                    resolve(validNotes);

                } catch (error) {
                    reject(error);
                }
                sql.close();
            })();
        });
    }

    static readById(noteid) {
        return new Promise((resolve, reject) => {
            (async () => {
                // › › connect to DB
                // › › query DB (SELECT Book JOIN BookAuthor JOIN Author WHERE bookid)
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .query(`
                        SELECT n.noteID, n.noteName, n.noteContent, n.FK_categoryID, FK_userID, c.categoryName
                        FROM cnNote n
                        JOIN cnCategory c
                            ON c.categoryID = n.FK_categoryID
                    `)

                    const notes = [];   // this is NOT validated yet
                    let lastNoteIndex = -1;
                    result.recordset.forEach(record => {
                        if (record.noteID == noteid) {
                            const newNote = {
                                noteID: record.noteID,
                                noteName: record.noteName,
                                noteContent: record.noteContent,
                                noteCategory: {
                                    categoryID: record.FK_categoryID,
                                    categoryName: record.categoryName
                                },
                                noteAuthor: record.FK_userID
                            }
                            notes.push(newNote);
                            lastNoteIndex++;
                        };
                    });

                    if (notes.length == 0) throw { statusCode: 404, errorMessage: `Note not found with provided noteid: ${noteid}` }
                    if (notes.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, noteid: ${noteid}` }

                    const { error } = Note.validate(notes[0]);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt Note informaion in database, noteid: ${noteid}` }

                    resolve(new Note(notes[0]));

                } catch (error) {
                    reject(error);
                }

                sql.close();
            })();
        });
    }

    static readByUserId(userID) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('userID', sql.Int(), userID)
                        .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID, n.FK_categoryID, c.categoryName
                            FROM cnNote n
                            JOIN cnCategory c ON c.categoryID = n.FK_categoryID
                            WHERE n.FK_userID = @userID
                            ORDER BY n.noteID, n.FK_userID
                    `);

                    const notesByUserID = [];   
                    let lastNoteIndex = -1;
                    result.recordset.forEach(record => {
                        if (record.FK_userID) {
                            const newNote = {
                                noteID: record.noteID,
                                noteName: record.noteName,
                                noteContent: record.noteContent,
                                noteCategory: {
                                    categoryID: record.FK_categoryID,
                                    categoryName: record.categoryName
                                },
                                noteAuthor: record.FK_userID
                            }
                            notesByUserID.push(newNote);
                            lastNoteIndex++;
                        };
                    });

                    if (notesByUserID.length == 0) throw { statusCode: 404, errorMessage: `User not found with provided userID: ${userID}` }

                    const { error } = Note.validate(notesByUserID);

                    resolve(notesByUserID);
                } catch (error) {
                    console.log(error);

                    reject(error);
                }

                sql.close();
            })();
        });
    }

  create() {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    // Checking if note already exists in DB from noteID and noteName
                    let pool = await sql.connect(con);
                    const checkNoteExists = await pool.request()
                        .input('noteID', sql.Int(), this.noteID)
                        .input('noteName', sql.NVarChar(50), this.noteName)
                        .query(`
                            SELECT *
                            FROM cnNote n
                            WHERE n.noteID = @noteID AND n.noteName = @noteName
                        `);

                    if (checkNoteExists.recordset.length == 1) throw { statusCode: 409, errorMessage: `Error. Note with ID already exists, noteID: ${checkNoteExists.recordset[0].noteID}. Note name is: ${checkNoteExists.recordset[0].noteName}` }
                    if (checkNoteExists.recordset.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, noteID: ${checkNoteExists.recordset[0].noteID}. Note name is: ${checkNoteExists.recordset[0].noteName}` }

                    pool = await sql.connect(con);
                    const insertNote = await pool.request()
                        .input('noteName', sql.NVarChar(50), this.noteName)
                        .input('noteContent', sql.NVarChar(4000), this.noteContent)
                        .input('FK_userID', sql.Int(), this.noteAuthor)
                        .input('FK_categoryID', sql.Int(), this.noteCategory.categoryID)
                        .input('categoryName', sql.NVarChar(50), this.noteCategory.categoryName)
                        .query(`
                            INSERT INTO cnNote ([noteName], [noteContent], [FK_categoryID], [FK_userID])
                            VALUES (@noteName, @noteContent, @FK_categoryID, @FK_userID);

                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID, n.FK_categoryID, c.categoryName
                            FROM cnNote n
                                JOIN cnCategory c
                                ON c.categoryID = n.FK_categoryID

                            WHERE n.noteID = SCOPE_IDENTITY();
                    `);

                    const insertNotes = [];
                    let lastNoteIndex = -1;
                    insertNote.recordset.forEach(record => {
                        console.log(record);
                        console.log(' inde i forEach insert note');
                            const newNote = {
                                noteID: record.noteID,
                                noteName: record.noteName,
                                noteContent: record.noteContent,
                                noteCategory: {
                                    categoryID: record.FK_categoryID,
                                    categoryName: record.categoryName
                                },
                                noteAuthor: record.FK_userID
                            }
                            insertNotes.push(newNote);
                            lastNoteIndex++;             
                    });

                    const postNote = insertNotes[0];
                    const { error } = Note.validate(postNote);

                    if (error) throw { statusCode: 500, errorMessage: 'Corrupt note informaion in database.' }

                    if (!insertNote.recordset[0]) throw { statusCode: 404, errorMessage: `Error inserting into DB, INSERT not found.` }
                    if (!insertNote.recordset[0]) throw { statusCode: 500, errorMessage: `DB server error, INSERT failed.` }
                    
                    sql.close();
                    
                    const note = await Note.readById(postNote.noteID);

                    resolve(note);

                } catch (error) {
                    reject(error);
                }

                sql.close();

            })();
        });
    }  

    static delete(noteID) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('noteID', sql.Int(), noteID)
                        .query(`
                        DELETE cnNote
                        WHERE noteID = @noteID
                    `);
                    console.log(result);
                    resolve(result);

                } catch (error) {
                    reject(error);
                }

                sql.close();

            })();
        });
    }

    update() {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con);
                    const updateNote = await pool.request()
                        .input('noteName', sql.NVarChar(50), this.noteName)
                        .input('noteContent', sql.NVarChar(), this.noteContent)
                        .input('noteID', sql.Int(), this.noteID)
                        .query(`
                            UPDATE cnNote
                            SET
                                noteName = @noteName,
                                noteContent = @noteContent

                            WHERE noteID = @noteID;
                        `);

                    sql.close();

                    resolve(updateNote);

                } catch (error) {
                    reject(error);
                }
                sql.close();
            })();
        });
    }

}

module.exports = Note;
