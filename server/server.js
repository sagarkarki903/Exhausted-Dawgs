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
const reportsRoutes = require("./reportserver/reports");
const FRONTEND_URL = process.env.FRONTEND || 'http://localhost:5173';
const galleryRoutes = require("./galleryRoutes");
const axios = require("axios"); 

const pool = require('./db');

//for login authorization added by Sagar on 3/20/2025 3: 46am
const authRouter = require("./authRoutes")
const roleRequestsRouter = require('./roleRequestsRoutes');

// Load environment variables from the .env file
dotenv.config();
const app = express();

const corsOptions = {
    origin: FRONTEND_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true
};

app.use(cors(corsOptions))
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", FRONTEND_URL); // not '*'
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    next();
  });
  
  app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", FRONTEND_URL);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.sendStatus(200);
  });
  
  
  
app.use(cookieParser()); // ✅ Middleware to handle cookies
app.use(express.json()); // Parse JSON request bodies
app.use("/auth", authRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
app.get('/', (req, res) => {
    res.send('Hello, Dawgs!');
});

app.get("/cookie-test", (req, res) => {
    res.json({
      message: "Cookie Test",
      cookies: req.cookies,
      token: req.cookies.auth_token || null,
    });
  });
  
app.get("/api/breeds", async (req, res) => {
  try {
    const dogRes = await axios.get("https://dog.ceo/api/breeds/list/all");
    res.json(dogRes.data);
  } catch (err) {
    console.error("Error proxying breeds:", err);
    res.status(502).json({ error: "Failed to fetch breeds" });
  }
});


app.use('/dogs', dogsRouter);

app.use('/log-sign', logsignRouter);

app.use('/users', userRouter);

app.use('/schedule', scheduleRouter);

app.use('/newschedule', newscheduleRouter); 

app.use("/report", reportRouter);


app.use("/calendar", calendarRouter);

app.use("/reports", reportsRoutes);

app.use("/gallery", galleryRoutes);

app.use('/role-requests', roleRequestsRouter); // new



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));