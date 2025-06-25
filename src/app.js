require('dotenv').config({ path: './.env' });
const express = require("express");
const cors = require("cors");
const app = express();


app.use(cors({
    origin: process.env.HOST,
    credentials: true
}))

require('./models/database.js').connectDatabase()

app.use(require('morgan')('tiny'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const session = require("express-session");
const cookieparser = require("cookie-parser");

app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.EXPRESS_SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, 
            sameSite: "None", 
            secure: process.env.NODE_ENV === 'production', 
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
