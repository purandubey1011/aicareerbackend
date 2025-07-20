require('dotenv').config({ path: './.env' });
const express = require("express");
const cors = require("cors");
const app = express();

// app.use(cors({
//     origin: process.env.HOST,
//     credentials: true
// }))

const allowedOrigins = ["http://localhost:5173", "https://aicareerfinder.xyz", "https://www.aicareerfinder.xyz"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400, // Cache preflight responses for 24 hours
  })
);

require('./models/database.js').connectDatabase()

app.use(require('morgan')('tiny'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const session = require("express-session");
const cookieparser = require("cookie-parser");

// Session configuration
const MongoStore = require('connect-mongo');
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL, // make sure it's correct
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

app.use(cookieparser());

// index routes
app.use('/api/v1/user/', require('./routes/index.routes.js'))
app.use('/api/v1/form/', require('./routes/form.routes.js'))
app.use('/api/v1/ai/', require('./routes/ai.routes.js'))

// Error handling 
const ErrorHandler = require('./utils/ErrorHandler');
const { generatedErrors } = require('./middlewares/Error.js');
app.use(/(.*)/, (req, res, next) => {
    next(new ErrorHandler(`Requested URL Not Found: ${req.url}`, 404));
});
app.use(generatedErrors)

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
