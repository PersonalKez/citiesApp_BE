import { validationResult, matchedData } from "express-validator";
import DB from "./database.js";

const validation_result = validationResult.withDefaults({
    formatter: (error) => error.msg,
});

class Controller {
    static validation = (req, res, next) => {
        const errors = validation_result(req).mapped();
        if (Object.keys(errors).length) {
            return res.status(422).json({
                ok: 0,
                status: 422,
                errors,
            });
        }
        next();
    };

    static create = async (req, res, next) => {
        const { date, city_name, country } = matchedData(req);
        try {
            const [result] = await DB.execute(
                "INSERT INTO `cities` (`date`,`city_name`,`country`) VALUES (?,?,?)",
                [date, city_name, country]
            );
            res.status(201).json({
                ok: 1,
                status: 201,
                message: "Post has been created successfully",
                post_id: result.insertId,
            });
        } catch (e) {
            next(e);
        }
    };

    static show_cities = async (req, res, next) => {
        try {
            let sql = "SELECT * FROM `cities`";
            if (req.params.id) {
                sql = `SELECT * FROM cities WHERE id=${req.params.id}`;
            }
            const [row] = await DB.query(sql);
            if (row.length === 0 && req.params.id) {
                return res.status(404).json({
                    ok: 0,
                    status: 404,
                    message: "Invalid post ID.",
                });
            }
            const post = req.params.id ? { post: row[0] } : { posts: row };
            res.status(200).json({
                ok: 1,
                status: 200,
                ...post,
            });
        } catch (e) {
            next(e);
        }
    };

    static edit_city = async (req, res, next) => {
        try {
            const data = matchedData(req);
            const [row] = await DB.query("SELECT * FROM `cities` WHERE `id`=?", [
                data.post_id,
            ]);

            if (row.length !== 1) {
                return res.json({
                    ok: 0,
                    statu: 404,
                    message: "Invalid post ID.",
                });
            }
            const post = row[0];
            const date = data.date || post.date;
            const city_name = data.city_name || post.city_name;
            const country = data.country || post.country;
            await DB.execute(
                "UPDATE `cities` SET `date`=?, `city_name`=?,`country`=? WHERE `id`=?",
                [date, city_name, country, data.id]
            );
            res.json({
                ok: 1,
                status: 200,
                message: "City Updated Successfully",
            });
        } catch (e) {
            next(e);
        }
    };

    static delete_city = async (req, res, next) => {
        try {
            const [result] = await DB.execute(
                "DELETE FROM `cities` WHERE `id`=?",
                [req.body.post_id]
            );
            if (result.affectedRows) {
                return res.json({
                    ok: 1,
                    status: 200,
                    message: "City has been deleted successfully.",
                });
            }
            res.status(404).json({
                ok: 0,
                status: 404,
                message: "Invalid city ID.",
            });
        } catch (e) {
            next(e);
        }
    };
}

export default Controller;