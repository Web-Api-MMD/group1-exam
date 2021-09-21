const config = require('config');

const sql = require('mssql');
const con = config.get('dbConfig_UCN');

const Joi = require('joi');

const _ = require('lodash');

const Author = require('./author');

class Note {
    constructor(noteObj) {
        this.noteID = noteObj.noteID;
        this.noteName = noteObj.noteName;
        this.noteContent = noteObj.noteContent;
        // if (noteObj.authors) this.authors = _.cloneDeep(noteObj.authors);
    }
    copy(noteObj) {
        if (noteObj.noteID) this.noteID = noteObj.noteID;
        if (noteObj.noteName) this.noteName = noteObj.noteName;
        if (noteObj.noteContent) this.noteContent = noteObj.noteContent;
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
                .min(1),
            // userID: Joi.number()
            //     .integer()
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
                        result = await pool.request()
                            .input('noteID', sql.Int(), noteid)
                            .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID 
                            FROM cnNote n
                            WHERE n.noteID = @noteID
                            ORDER BY n.noteID, n.FK_userID
                        `);
                    } else {
                        console.log('test 3');
                        result = await pool.request()
                            .query(`
                            SELECT * 
                            FROM cnNote n
                        `);
                    }
                    // console.log(JSON.stringify(result.recordset) + ' log af result recordset');
                    
                    
                    const notes = [];   // this is NOT validated yet
                    let lastNoteIndex = -1;
                    result.recordset.forEach(record => {
                        if (notes.noteid) {
                            console.log(`Note with id ${record.noteID} already exists.`);
                            const newNote = {
                                noteID: record.noteID,
                                noteName: record.noteName,
                                noteContent: record.noteContent,
                            }
                            notesByUserID.push(newNote);
                            lastNoteIndex++;
                        } else {
                            console.log(`Note with id ${record.noteID} is a new note.`);
                            console.log(record);
                            const newNote = {
                                noteID: record.noteID,
                                noteName: record.noteName,
                                noteContent: record.noteContent,
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
                        .input('noteID', sql.Int(), noteid)
                        .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID 
                            FROM cnNote n
                            WHERE n.noteID = @noteID
                            ORDER BY n.noteID, n.FK_userID
                    `)

                    const notes = [];   // this is NOT validated yet
                    let lastNoteIndex = -1;
                    result.recordset.forEach(record => {
                        if (record.noteID == noteid) {
                            const newNote = {
                                noteID: record.noteID,
                                noteName: record.noteName,
                                noteContent: record.noteContent,
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
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID 
                            FROM cnNote n
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
                // › › check if book already exists in DB (e.g. matching title and year)
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
                    this.authors.forEach(async (author) => {
                        const authorCheck = await Author.readById(author.authorid);
                    });

                    const pool = await sql.connect(con);
                    const resultCheckNote = await pool.request()
                        .input('title', sql.NVarChar(50), this.title)
                        .input('year', sql.Int(), this.year)
                        .query(`
                            SELECT *
                            FROM liloBook b
                            WHERE b.title = @title AND b.year = @year
                        `)

                    if (resultCheckNote.recordset.length == 1) throw { statusCode: 409, errorMessage: `Conflict. Book already exists, bookid: ${resultCheckNote.recordset[0].bookid}` }
                    if (resultCheckNote.recordset.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, bookid: ${resultCheckNote.recordset[0].bookid}` }

                    await pool.connect();
                    const result00 = await pool.request()
                        .input('title', sql.NVarChar(50), this.title)
                        .input('year', sql.Int(), this.year)
                        .input('link', sql.NVarChar(255), this.link)
                        .input('authorid', sql.Int(), this.authors[0].authorid)
                        .query(`
                                INSERT INTO liloBook (title, year, link)
                                VALUES (@title, @year, @link);
                        
                                SELECT *
                                FROM liloBook
                                WHERE bookid = SCOPE_IDENTITY();

                                INSERT INTO liloBookAuthor (FK_bookid, FK_authorid)
                                VALUES (SCOPE_IDENTITY(), @authorid);
                        `)

                    if (!result00.recordset[0]) throw { statusCode: 500, errorMessage: `DB server error, INSERT failed.` }
                    const bookid = result00.recordset[0].noteid;

                    this.authors.forEach(async (author, index) => {
                        if (index > 0) {
                            await pool.connect();
                            const resultAuthors = await pool.request()
                                .input('bookid', sql.Int(), bookid)
                                .input('authorid', sql.Int(), author.authorid)
                                .query(`
                                    INSERT INTO liloBookAuthor (FK_bookid, FK_authorid)
                                    VALUES (@bookid, @authorid)
                                `)
                        }
                    })

                    sql.close();

                    const note = await Note.readById(noteid);

                    resolve(note);

                } catch (error) {
                    reject(error);
                }

                sql.close();

            })();
        });
    }

    static delete(noteid) {
        return new Promise((resolve, reject) => {
            (async () => {
                // › › connect to DB
                // › › query DB (SELECT Book JOIN BookAuthor JOIN Author WHERE bookid) <-- moving this before the DB connection, calling readById instead
                // › › query DB (DELETE BookAuthor WHERE bookid, DELETE Book WHERE bookid)
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                try {
                    const note = await Note.readById(noteid);

                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('noteid', sql.Int(), noteid)
                        .query(`
                        DELETE liloBookAuthor
                        WHERE FK_bookid = @bookid;

                        DELETE liloLoan
                        WHERE FK_bookid = @bookid;

                        DELETE liloBook
                        WHERE bookid = @bookid
                    `);

                    resolve(note);

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
                    const oldNote = await Note.readById(this.noteid);   // <-- this was (should have been) checked already in the route handler

                    this.authors.forEach(async (author) => {
                        const authorCheck = await Author.readById(author.authorid);
                    });

                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('title', sql.NVarChar(50), this.title)
                        .input('year', sql.Int(), this.year)
                        .input('link', sql.NVarChar(255), this.link)
                        .input('bookid', sql.Int(), this.bookid)
                        .input('authorid', sql.Int(), this.authors[0].authorid)
                        .query(`
                            UPDATE liloBook
                            SET
                                title = @title,
                                year = @year,
                                link = @link
                            WHERE bookid = @bookid;

                            DELETE liloBookAuthor
                            WHERE FK_bookid = @bookid;

                            INSERT INTO liloBookAuthor (FK_bookid, FK_authorid)
                            VALUES (@bookid, @authorid)
                        `);

                    this.authors.forEach(async (author, index) => {
                        if (index > 0) {
                            await pool.connect();
                            const resultAuthors = await pool.request()
                                .input('bookid', sql.Int(), this.bookid)
                                .input('authorid', sql.Int(), author.authorid)
                                .query(`
                                        INSERT INTO liloBookAuthor (FK_bookid, FK_authorid)
                                        VALUES (@bookid, @authorid)
                                    `);
                        }
                    });

                    sql.close();

                    const note = await Note.readById(this.noteid);

                    resolve(note);

                } catch (error) {
                    reject(error);
                }

                sql.close();

            })();
        });
    }

}

module.exports = Note;
