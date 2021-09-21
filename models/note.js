const config = require('config');

const sql = require('mssql');
const con = config.get('dbConfig_UCN');

const Joi = require('joi');

const _ = require('lodash');

const Author = require('./author');
const { valid } = require('joi');

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
                .max(50)
                .required(),
            noteContent: Joi.string()
                .min(1),
            // link: Joi.string()
            //     .uri()
            //     .max(255)
            //     .allow(null),   // <-- need to allow null values for links
            // authors: Joi.array()
            //     .items(
            //         Joi.object({
            //             authorid: Joi.number()
            //                 .integer()
            //                 .min(1)
            //                 .required(),
            //             firstname: Joi.string()
            //                 .max(50),
            //             lastname: Joi.string()
            //                 .min(1)
            //                 .max(50)
            //         })
            //     )
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

                    // if (userid) {
                    //     result = await pool.request()
                    //         .input('userID', sql.Int(), userid)
                    //         .query(`
                    //         SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID 
                    //         FROM cnNote n
                    //         WHERE n.FK_userID = @userID
                    //         ORDER BY n.noteID, n.FK_userID
                    //     `);
                    // }
                    if (noteid) {
                        result = await pool.request()
                            .input('noteID', sql.Int(), noteid)
                            .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID 
                            FROM cnNote n
                            WHERE n.noteID = @noteID
                            ORDER BY n.noteID, n.FK_userID
                        `);
                    }

                     else {
                        console.log('test 2');
                        result = await pool.request()
                            .query(`
                            SELECT n.noteID, n.noteName, n.noteContent, n.FK_userID 
                            FROM cnNote n
                            ORDER BY n.noteID, n.FK_userID
                        `);
                    }
                    console.log(result.recordset + ' log af result recordset');
                    const notes = [];   // this is NOT validated yet
                    let lastNoteIndex = -1;
                    result.recordset.forEach(record => {
                        if (notes[lastNoteIndex] && record.noteid == notes[lastNoteIndex].noteid) {
                            console.log(`Note with id ${record.noteid} already exists.`);
                            const newUser = {
                                userID: record.userID,
                                userName: record.userName,
                                userEmail: record.userEmail
                            }
                            note[lastNoteIndex].authors.push(newUser);
                        } else {
                            console.log(`Note with id ${record.noteid} is a new note.`)
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
                    console.log(validNotes + ' valid notes')
                    resolve(validNotes);
                    // resolve(notes);

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
                        .input('noteid', sql.Int(), noteid)
                        .query(`
                            SELECT b.noteid, b.title, b.year, b.link, a.authorid, a.firstname, a.lastname 
                            FROM liloBook b
                            JOIN liloBookAuthor ba
                                ON b.noteid = ba.FK_noteid
                            JOIN liloAuthor a
                                ON ba.FK_authorid = a.authorid
                            WHERE b.noteid = @noteid
                    `)

                    const notes = [];   // this is NOT validated yet
                    let lastNoteIndex = -1;
                    result.recordset.forEach(record => {
                        if (notes[lastNoteIndex] && record.noteid == notes[lastNoteIndex].noteid) {
                            console.log(`Note with id ${record.noteid} already exists.`);
                            const newAuthor = {
                                authorid: record.authorid,
                                firstname: record.firstname,
                                lastname: record.lastname
                            }
                            notes[lastNoteIndex].authors.push(newAuthor);
                        } else {
                            console.log(`Note with id ${record.noteid} is a new note.`)
                            const newNote = {
                                noteid: record.noteid,
                                title: record.title,
                                year: record.year,
                                link: record.link,
                                authors: [
                                    {
                                        authorid: record.authorid,
                                        firstname: record.firstname,
                                        lastname: record.lastname
                                    }
                                ]
                            }
                            notes.push(newNote);
                            lastNoteIndex++;
                        }
                    });

                    if (notes.length == 0) throw { statusCode: 404, errorMessage: `Book not found with provided bookid: ${bookid}` }
                    if (notes.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, bookid: ${bookid}` }

                    const { error } = Note.validate(notes[0]);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt Book informaion in database, bookid: ${bookid}` }

                    resolve(new Note(notes[0]));

                } catch (error) {
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
