const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dogsRouter = require('./dogsInventoryRoutes');
const userRouter = require('./admin/users');
const logsignRouter = require('./logsign');
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
app.use(cookieParser()); // ✅ Middleware to handle cookies
app.use(express.json()); // Parse JSON request bodies

 
app.get('/', (req, res) => {
    res.send('Hello, Dawgs!');
});


app.use('/dogs', dogsRouter);

app.use('/log-sign', logsignRouter);

app.use('/users', userRouter);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));