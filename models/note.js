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
        // if (noteObj.authors) this.authors = _.cloneDeep(noteObj.authors);
    }
    copy(noteObj) {
        if (noteObj.noteID) this.noteID = noteObj.noteID;
        if (noteObj.noteName) this.noteName = noteObj.noteName;
        if (noteObj.noteContent) this.noteContent = noteObj.noteContent;
        if (noteObj.noteCategory) this.noteCategory = noteObj.noteCategory;
        if (noteObj.noteAuthor) this.noteAuthor = noteObj.noteAuthor;
        // if (noteObj.authors) this.authors = _.cloneDeep(noteObj.authors);
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
                console.log('test 0');
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
                    console.log('test 1');

                    const pool = await sql.connect(con);
                    let result;
                    if (noteid) {
                        console.log('test 2');
                        result = await pool.request()
                            .input('noteID', sql.Int(), noteid)
                            // OLD QUERY
                            // .query(`
                            // SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID 
                            // FROM cnNote n
                            // WHERE n.noteID = @noteID
                            // ORDER BY n.noteID, n.FK_userID
                            // `);
                            // OLD QUERY

                            // TEST QUERY
                            .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_categoryID, n.FK_userID, c.categoryName
                            FROM cnNote n
                            JOIN cnCategory c ON c.categoryID = n.FK_categoryID
                            WHERE n.noteID = @noteID
                            `);
                    } else {
                        console.log('test 3');
                        result = await pool.request()
                        //     .query(`
                        //     SELECT * 
                        //     FROM cnNote n
                        // `);
                        .query(`
                        SELECT n.noteID, n.noteName, n.noteContent, n.FK_categoryID, n.FK_userID, c.categoryName
                        FROM cnNote n
                        JOIN cnCategory c ON c.categoryID = n.FK_categoryID
                        `);

                    }
                    // console.log(JSON.stringify(result.recordset) + ' log af result recordset');
                    // console.log('Result ny: ' + result);
                    
                    const notes = [];   // this is NOT validated yet
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
                        console.log(JSON.stringify(notes) + ' log af notes');
                    });

                    const validNotes = [];

                    notes.forEach(note => {
                        const { error } = Note.validate(note);
                        if (error) throw { errorMessage: `Note.validate failed.` };
                        validNotes.push(new Note(note));
                    });
                    // console.log(validNotes + ' valid notes');
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
                        // .input('noteID', sql.Int(), noteid)
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

    static readByUserId(userid) {
        return new Promise((resolve, reject) => {
            (async () => {
                console.log('test userid log 0');

                // › › connect to DB
                // › › query DB (SELECT Book JOIN BookAuthor JOIN Author WHERE bookid)
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                try {
                console.log('test userid log 1');

                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('userID', sql.Int(), userid)
                        .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID, n.FK_categoryID, c.categoryName
                            FROM cnNote n
                            JOIN cnCategory c ON c.categoryID = n.FK_categoryID
                            WHERE n.FK_userID = @userID
                            ORDER BY n.noteID, n.FK_userID
                    `);
                    console.log(result);

                    const notesByUserID = [];   // this is NOT validated yet
                    let lastNoteIndex = -1;
                    result.recordset.forEach(record => {
                        console.log(record.FK_userID + ' this is the record');
                        console.log(userid);

                        // console.log(record.FK_userID + ' hej');
                        if (record.FK_userID) {
                            console.log('test userid log 2');

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

                    console.log('Resultat af notes: ' + JSON.stringify(notesByUserID));

                    if (notesByUserID.length == 0) throw { statusCode: 404, errorMessage: `User not found with provided userID: ${userid}` }
                    // if (notesByUserID.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, userID: ${userid}` }

                    const { error } = Note.validate(notesByUserID);
                    // if (error) throw { statusCode: 500, errorMessage: `Corrupt Note informaion in database, userID: ${userid}` }

                    // resolve(new Note(notesByUserID));
                    resolve(notesByUserID);
                    // console.log('userid efter resolve');


                } catch (error) {
                    // console.log('test userid log error');
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
                // › › check if authors exist in DB (i.e. Author.readById(authorid))
                // › › connect to DB
                // › › check if note already exists in DB (e.g. matching noteID)
                // › › query DB (INSERT Book, SELECT Book WHERE SCOPE_IDENTITY(), INSERT BookAuthor)
                // › › check if exactly one result
                // › › keep bookid safe
                // › › queryDB* (INSERT BookAuthor) as many more times needed (with bookid)
                // › › ((query DB query DB (SELECT Book JOIN BookAuthor JOIN Author WHERE bookid))) ==>
                // › ›      close the DB because we are calling 
                // › ›             Book.readById(bookid)
                // › › // restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › // validate objects
                // › › close DB connection

                try {
                    // this.authors.forEach(async (author) => {
                    //     const authorCheck = await Author.readById(author.authorid);
                    // });

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



                    // console.log('hej lige inden insertNote');
                    // console.log(this.noteCategory.categoryID + ' catID')
                    // await pool.connect();
                    pool = await sql.connect(con);
                    const insertNote = await pool.request()
                        // .input('noteID', sql.Int(), this.noteID)
                        .input('noteName', sql.NVarChar(50), this.noteName)
                        .input('noteContent', sql.NVarChar(4000), this.noteContent)
                        .input('FK_userID', sql.Int(), this.noteAuthor)
                        .input('FK_categoryID', sql.Int(), this.noteCategory.categoryID)
                        .input('categoryName', sql.NVarChar(50), this.noteCategory.categoryName)
                        // .query(`
                        //         INSERT INTO cnNote ([noteName], [noteContent], [FK_categoryID], [FK_userID])
                        //         VALUES (@noteName, @noteContent, @FK_categoryID, @FK_userID);

                        //         SELECT *
                        //         FROM cnNote
                        //         WHERE noteID = SCOPE_IDENTITY();
                        // `);
                        .query(`
                            INSERT INTO cnNote ([noteName], [noteContent], [FK_categoryID], [FK_userID])
                            VALUES (@noteName, @noteContent, @FK_categoryID, @FK_userID);

                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID, n.FK_categoryID, c.categoryName
                            FROM cnNote n
                                JOIN cnCategory c
                                ON c.categoryID = n.FK_categoryID

                            WHERE n.noteID = SCOPE_IDENTITY();
                    `);
                    // console.log(this.noteName + ' NoteName log');
                    // console.log(this.noteContent + ' noteContent log');
                    // console.log(this.noteAuthor + ' noteAuthor log');
                    // console.log(this.noteCategory.categoryID + ' categoryID log');

                    // console.log(JSON.stringify(insertNote.recordsets[0]) + ' insertNote');
                        //GEM
                        // SELECT SCOPE_IDENTITY()
                        // FROM cnNote

                        // INSERT INTO cnNote (noteID)
                        // VALUES (SCOPE_IDENTITY())

                        //GAMMEL
                        // INSERT INTO cnNote (noteID, noteName, noteContent, FK_userID, FK_categoryID)
                        // SELECT noteID, @noteName, @noteContent, @FK_userID, @FK_categoryID
                        // FROM cnNote
                        // WHERE @noteID = SCOPE_IDENTITY();

                    // const insertResponse = {
                    //     noteID: insertNote.recordsets.noteID,
                    //     noteName: insertNote.recordsets.noteName,
                    //     noteContent: insertNote.recordsets.noteContent,
                    //     noteCategory: {
                    //         categoryID: insertNote.recordsets.FK_categoryID,
                    //         // categoryName: insertNote.recordsets.categoryName,
                    //     },
                    //     noteAuthor: insertNote.recordsets.FK_userID
                    // }
                    const insertNotes = [];   // this is NOT validated yet
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
                    // console.log(JSON.stringify(insertNotes[0]) + ' insertNotes');

                    const postNote = insertNotes[0];
                    // console.log(postNote + ' post nooooooote');
                    const { error } = Note.validate(postNote);
                    // console.log(error + ' error fra validate'); // HER FINDER VI MÅSKE FEJLEN
                    if (error) throw { statusCode: 500, errorMessage: 'Corrupt note informaion in database.' }

                    // console.log(JSON.stringify(insertNote.recordset) + ' log af insert note recordset');
                    if (!insertNote.recordset[0]) throw { statusCode: 404, errorMessage: `Error inserting into DB, INSERT not found.` }
                    if (!insertNote.recordset[0]) throw { statusCode: 500, errorMessage: `DB server error, INSERT failed.` }
                    
                    sql.close();
                    
                    const note = await Note.readById(postNote.noteID);
                    // console.log(insertResponse + ' console log af insertResponse');

                    resolve(note);
                    // resolve(insertNote);

                } catch (error) {
                    // console.log(error);
                    reject(error);
                }

                sql.close();

            })();
        });
    }  

    static delete(noteID) {
        return new Promise((resolve, reject) => {
            (async () => {
                // › › connect to DB
                // › › query DB (SELECT Book JOIN BookAuthor JOIN Author WHERE bookid) <-- moving this before the DB connection, calling readById instead
                // › › query DB (DELETE BookAuthor WHERE bookid, DELETE Book WHERE bookid)
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                try {
                    // const note = await Note.readById(noteID);

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
                // › › check if book already exists in DB (i.e. Book.readById(bookid))
                // › › check if authors exist in DB (i.e. Author.readById(authorid))
                // › › connect to DB
                // › › query DB (UPDATE Book WHERE bookid)
                // › › queryDB (DELETE BookAuthor WHERE bookid, INSERT BookAuthor)
                // › › queryDB* (INSERT BookAuthor) as many more times needed (with bookid)
                // › › query DB query DB (SELECT Book JOIN BookAuthor JOIN Author WHERE bookid)
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                try {
                    // const oldNote = await Note.readById(this.noteid);   // <-- this was (should have been) checked already in the route handler

                    // this.authors.forEach(async (author) => {
                    //     const authorCheck = await Author.readById(author.authorid);
                    // });
                    console.log(this.noteID);
                    console.log(this.noteName);
                    console.log(this.noteContent);
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
                        // SOME OF THE QUERY
                        
                        // DELETE liloBookAuthor
                        // WHERE FK_bookid = @bookid;

                        // INSERT INTO liloBookAuthor (FK_bookid, FK_authorid)
                        // VALUES (@bookid, @authorid)

                    // this.authors.forEach(async (author, index) => {
                    //     if (index > 0) {
                    //         await pool.connect();
                    //         const resultAuthors = await pool.request()
                    //             .input('bookid', sql.Int(), this.bookid)
                    //             .input('authorid', sql.Int(), author.authorid)
                    //             .query(`
                    //                     INSERT INTO liloBookAuthor (FK_bookid, FK_authorid)
                    //                     VALUES (@bookid, @authorid)
                    //                 `);
                    //     }
                    // });

                    sql.close();

                    // const note = await Note.readById(this.noteID);

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
