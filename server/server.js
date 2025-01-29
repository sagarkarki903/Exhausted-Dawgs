require("dotenv").config(); // Load environment variables
const express = require("express");
const app = express();
const cors = require("cors")
const pool = require("./db.js") //imports mysql pool

const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
};
app.use(cors(corsOptions))
app.use(express.json()); // Parse JSON request bodies





app.get("/", (req, res) => {
    res.json("Welcome to the server Dawgs!")
});

app.get("/test", (req, res) => {
    res.json("TEST TEST TEST! This data is fetched from the server.js")
})

//fetched users 
app.get("/members", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM dawg_members"); // Using async/await
        res.json(rows);
    } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Database query failed" });
    }
});


app.listen(8080, () => {
    console.log("Server started on port 8080");
});