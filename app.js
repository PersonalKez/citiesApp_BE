import express from "express";
import routes from "./routes.js";
import cors from "cors";
import Memcached from "memcached";
const app = express();
export const memcached = new Memcached('memcached', 11211);
const PORT = 3000;
app.use(express.json());
app.use(cors());
app.use(routes);

// Error Handling
app.use((err, req, res, next) => {
    console.log("Error happened...")
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));