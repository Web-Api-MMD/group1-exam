const express = require('express');
const router = express.Router();

const Categories = require('../models/category');

// get all categories
router.get('/:categoryID', async (req, res) => {
    // need to call the Book class for DB access...
    let categoryid;
    console.log(req.params.categoryID);
    // let userid;
    console.log(JSON.stringify(req.query) + ' request');
    if (req.params.categoryID) {
        categoryid = parseInt(req.params.categoryID);
        console.log(categoryid + ' categoryID fra route handler');
        if (!categoryid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?noteID= should refer an author id (integer)' }));
    }
    // else if (req.query.userID) {
    //     userid = parseInt(req.query.userID);
    //     console.log(userid + ' userid fra route handler');
    //     if (!userid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?userID= should refer an author id (integer)' }));
    // }

    try {
        if (req) {
            const categoryById = await Categories.readById(categoryid);
            return res.send(JSON.stringify(categoryById));
        } 
        else {
            const allCategories = await Categories.readById();
            return res.send(JSON.stringify(allCategories));
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send(JSON.stringify({ errorMessage: err + ' catch fra route handler' }));
    }
});

module.exports = router;