const express = require('express');
const router = express.Router();

const Categories = require('../models/category');

router.get('/', async (req, res) => {
    try {
        const allCategories = await Categories.readAll();
        return res.send(JSON.stringify(allCategories));
    } catch (err) {
        return res.status(err.statusCode).send(JSON.stringify(err));
    }
});


router.get('/:categoryID', async (req, res) => {
    let categoryid;

    if (req.params.categoryID) {
        categoryid = parseInt(req.params.categoryID);

        if (!categoryid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?noteID= should refer an author id (integer)' }));
    }

    try {
        if (req.params.categoryID) {
            const categoryById = await Categories.readById(categoryid);
            return res.send(JSON.stringify(categoryById));
        } 
        else {
            const allCategories = await Categories.readAll();
            return res.send(JSON.stringify(allCategories));
        }
    } catch (err) {
        return res.status(err.statusCode).send(JSON.stringify(err));
    }
});

module.exports = router;