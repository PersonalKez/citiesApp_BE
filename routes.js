import { Router } from "express";
import { body, param } from "express-validator";
import Controller from "./Controller.js";

const routes = Router({ strict: true });

// Create Data
routes.post(
    "/create",
    [
        body("date", "Must not be empty.").trim().not().isEmpty().escape(),
        body("city_name", "Must not be empty.").trim().not().isEmpty().escape(),
        body("country", "Must not be empty.").trim().not().isEmpty().escape(),
    ],
    Controller.validation,
    Controller.create
);

// Read Data
routes.get("/posts", Controller.show_posts);
routes.get(
    "/post/:id",
    [param("id", "Invalid post ID.").exists().isNumeric().toInt()],
    Controller.validation,
    Controller.show_posts
);

// Update Data
routes.put(
    "/edit",
    [
        body("post_id", "Invalid post ID").isNumeric().toInt(),
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
    ],
    Controller.validation,
    Controller.edit_post
);

// Delete Data
routes.delete(
    "/delete",
    [
        body("post_id", "Please provide a valid post ID.")
            .exists()
            .isNumeric()
            .toInt(),
    ],
    Controller.validation,
    Controller.delete_post
);

export default routes;