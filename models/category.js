const config = require('config');

const sql = require('mssql');
const con = config.get('dbConfig_UCN');

const Joi = require('joi');

const _ = require('lodash');

class Category {
    constructor(categoryObj) {
        this.categoryID = categoryObj.categoryID;
        this.categoryName = categoryObj.categoryName;
    }

    static validate(categoryObj) {
        const schema = Joi.object({
            categoryID: Joi.number()
                .integer()
                .min(1),
            categoryName: Joi.string()
                .min(1)
                .max(50)
        });

        return schema.validate(categoryObj);
    }

    static readById(categoryID) {
        return new Promise((resolve, reject) => {
            (async () => {
                // connect to DB
                // query DB
                // transform the result into the object structure of Category
                // validate
                // resolve (category)
                // reject (error)
                // CLOSE DB connection

                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('categoryID', sql.Int(), categoryID)
                        .query(`
                            SELECT *
                            FROM cnCategory c
                            WHERE c.categoryID = @categoryID
                        `)

                    const categories = [];
                    result.recordset.forEach(record => {
                        const category = {
                            categoryID: record.categoryID,
                            categoryName: record.categoryName,
                        }

                        categories.push(category);
                    });

                    if (categories.length == 0) throw { statusCode: 404, errorMessage: `Category not found with provided categoryID: ${categoryID}` }
                    if (categories.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, categoryID: ${categoryID}` }

                    const { error } = Category.validate(categories[0]);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt Category informaion in database, categoryID: ${categoryID}` }

                    resolve(new Category(categories[0]));

                } catch (error) {
                    reject(error);
                }

                sql.close();
            })();
        });
    }
}

module.exports = Category;
