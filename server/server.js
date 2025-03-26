const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const dogsRouter = require('./dogsInventoryRoutes');
const userRouter = require('./admin/users');
const logsignRouter = require('./logsign');
const scheduleRouter = require('./schedule');
const newscheduleRouter = require('./newschedule');
const reportRouter = require("./reportserver/report-list");
const calendarRouter = require('./calendar/calendar'); // adjust the path if needed

const pool = require('./db');

//for login authorization added by Sagar on 3/20/2025 3: 46am
const authRouter = require("./authRoutes")

//for photo uploads
// const uploadRoutes = require("./uploadRoute/upload");




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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
app.get('/', (req, res) => {
    res.send('Hello, Dawgs!');
});


app.use('/dogs', dogsRouter);

app.use('/log-sign', logsignRouter);

app.use('/users', userRouter);

app.use('/schedule', scheduleRouter);

app.use('/newschedule', newscheduleRouter); 

app.use("/report", reportRouter);

app.use("/auth", authRouter);

app.use("/calendar", calendarRouter);


// app.use("/upload", uploadRoutes);



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));