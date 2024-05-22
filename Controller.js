import { validationResult, matchedData } from "express-validator";
import DB from "./database.js";
import { memcached } from "./app.js";
import { promisify } from "util";


// helpers here

    // validation

const validation_result = validationResult.withDefaults({
    formatter: (error) => console.log(error.msg)
});

    // memcached stuff

function add_city_to_cache(city_name, country, date){
    memcached.add(city_name, {"city_name": city_name, "country": country, "date": date}, 60);
    memcached.get("set_of_all", (e, data) => {
        if(e)console.log(e);
        let cities = []
        if(data != (null || undefined)){
            cities = JSON.parse(data);
        }
        else return;
        cities.push({"city_name": city_name, "country": country, "date": date});
        memcached.set("set_of_all", JSON.stringify(cities), 60, e => console.log(e));
    })
    return;
}

function replace_city_in_cache(city_name, new_city_name, country, date){
    memcached.del(city_name);
    memcached.add(new_city_name, {"city_name": new_city_name, "country": country, "date": date}, 60)
    memcached.get("set_of_all", (e, data) => {
        if(e)console.log(e);
        let deserialised_data = []
        console.log("CACHE HERE")
        if(!data)return;
        deserialised_data = data? JSON.parse(data) : [];
        console.log(deserialised_data);
        deserialised_data.filter(obj => {obj.city_name !== city_name}); 
        console.log(deserialised_data);
        deserialised_data.push({"city_name": new_city_name, "country": country, "date": date});
        console.log(deserialised_data);
        memcached.set("set_of_all", JSON.stringify(deserialised_data), 60);
    })
    return;
}

function remove_from_cache(city_name){
    memcached.del(city_name);
    memcached.get("set_of_all", (e, data) => {
        if(e)console.log(e);
        let deserialised_data = [];
        if(!data)return;
        deserialised_data = data? JSON.parse(data) : [];
        console.log("AAAAAAAAAADWTFWRSGFTRGFRB GFRFGFRDE")
        console.log(data);
        deserialised_data.filter(obj => {obj.city_name !== city_name});
        console.log(deserialised_data);
        memcached.set("set_of_all", JSON.stringify(deserialised_data), 60);
    })
}

    // main Controller

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
            add_city_to_cache(city_name, country, date);
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
            let cities = [];
            const get_data_promise = promisify(memcached.get.bind(memcached));
            let data = await get_data_promise("set_of_all");
            data? cities = JSON.parse(data) : [];
            console.log(cities);
            if (cities.length === 0){
                console.log("not cached, falling back to db");
                let sql = "SELECT * FROM `cities`";
                [cities] = await DB.query(sql);
                if(cities.length !==0){
                    cities.forEach((el) => {
                    add_city_to_cache(el.city_name, el.country, el.date);
                })
                }
            }
            if (cities.length === 0) {
                return res.status(404).json({
                    ok: 0,
                    status: 404,
                    message: "No cities to return.",
                });
                } 
            res.status(200).json({
                ok: 1,
                status: 200,
                cities: cities,
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
            replace_city_in_cache(city_name, new_city_name, country, date);
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
        console.log("DELETING");
        console.log(req.params.city_name);
        try {
            const [result] = await DB.execute(
                "DELETE FROM `cities` WHERE `city_name`=?",
                [req.params.city_name]
            );
            if (result.affectedRows) {
                remove_from_cache(req.params.city_name);
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