require('dotenv').config({ path: './.env' });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

// ---------------------- CORS ----------------------
app.use(cors({
    origin: process.env.HOST, // e.g. https://your-frontend.com
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.options('*', cors()); // Enable preflight for all routes

// ---------------------- Middlewares ----------------------
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // 🟢 MUST come before session

// ---------------------- Session ----------------------
app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.EXPRESS_SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: "None", // 🟢 Cross-origin
            secure: process.env.NODE_ENV === 'production', // 🟢 HTTPS only in production
            httpOnly: true, // 🟢 Not accessible from JS
        },
    })
);

// ---------------------- DB ----------------------
require('./models/database.js').connectDatabase();

// ---------------------- Routes ----------------------
app.use('/api/v1/user/', require('./routes/index.routes.js'));
app.use('/api/v1/form/', require('./routes/form.routes.js'));
app.use('/api/v1/ai/', require('./routes/ai.routes.js'));

// ---------------------- Error Handling ----------------------
const ErrorHandler = require('./utils/ErrorHandler');
const { generatedErrors } = require('./middlewares/Error.js');

app.use(/(.*)/, (req, res, next) => {
    next(new ErrorHandler(`Requested URL Not Found: ${req.url}`, 404));
});
app.use(generatedErrors);

// ---------------------- Server ----------------------
app.listen(process.env.PORT, () => {
    console.log(`✅ Server running at http://localhost:${process.env.PORT}`);
});
