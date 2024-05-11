import { validationResult, matchedData } from "express-validator";
import DB from "./database.js";

const validation_result = validationResult.withDefaults({
    formatter: (error) => console.log(error.msg)
});

class Controller {
    static validation = (req, res, next) => {
        // Handle the POST request here
        const data = req.body;
        // Send a response back to the client
        console.log(data)
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
        console.log("Showing Cities!");
        try {
            let sql = "SELECT * FROM `cities`";
            const [row] = await DB.query(sql);
            if (row.length === 0) {
                return res.status(404).json({
                    ok: 0,
                    status: 404,
                    message: "No cities to return.",
                });
            }
            res.status(200).json({
                ok: 1,
                status: 200,
                cities: row,
            });
        } catch (e) {
            next(e);
        }
    };

    static edit_city = async (req, res, next) => {
        try {
            const data = matchedData(req);
            const [row] = await DB.query("SELECT * FROM `cities` WHERE `city_name`=?", [
                data.city_name,
            ]);

            if (row.length !== 1) {
                return res.json({
                    ok: 0,
                    statu: 404,
                    message: "No cities of that name.",
                });
            }
            console.log("Data is:" + JSON.stringify(data))
            const post = row[0];
            const date = data.date || post.date;
            const city_name = data.city_name || post.city_name;
            const country = data.country || post.country;
            const new_city_name = data.new_city_name || city_name;
            await DB.execute(
                "UPDATE `cities` SET `date`=?, `city_name`=?,`country`=? WHERE `city_name`=?",
                [date, new_city_name, country, city_name]
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
        console.log("GOT HERE")
        console.log(req.params.city_name)
        try {
            const [result] = await DB.execute(
                "DELETE FROM `cities` WHERE `city_name`=?",
                [req.params.city_name]
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
                message: "Invalid city name.",
            });
        } catch (e) {
            next(e);
        }
    };
}

export default Controller;