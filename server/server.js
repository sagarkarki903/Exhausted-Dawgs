const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dogsRouter = require('./dogsInventoryRoutes');
const pool = require('./db');

// Load environment variables from the .env file
dotenv.config();
const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
};

app.use(cors(corsOptions))
app.use(express.json()); // Parse JSON request bodies

 
app.get('/', (req, res) => {
    res.send('Hello, Dawgs!');
});


app.use('/dogs', dogsRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));