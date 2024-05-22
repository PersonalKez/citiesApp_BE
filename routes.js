import { Router } from "express";
import { body, param } from "express-validator";
import Controller from "./Controller.js";

const routes = Router({ strict: true });

// Create Data
routes.post(
    "/create",
    [
        body("city_name", "Must not be empty.").trim().not().isEmpty().escape(),
        body("country", "Must not be empty.").trim().not().isEmpty().escape(),
        body("date", "Must not be empty.").trim().not().isEmpty().escape(),
    ],
    Controller.validation,
    Controller.create
);

// Read Data
routes.get("/cities", Controller.show_cities);


// Update Data
routes.put(
    "/edit",
    [
        body("date", "Must not be empty.")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),
        body("city_name", "Must not be empty.")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),
        body("country", "Must not be empty.")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),
        body("new_city_name", "Must not be empty.")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),
    ],
    Controller.validation,
    Controller.edit_city
);

// Delete Data
routes.delete(
    "/delete/:city_name",
    [
        [param("city_name", "Invalid city ID.").exists()],
    ],
    Controller.validation,
    Controller.delete_city
);

export default routes;