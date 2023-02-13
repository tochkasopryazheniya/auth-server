const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const errorMiddleWare = require('./middleware/error-middleware')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');


const app = express();
// app.use(cors({
//     credentials: true,
//     origin: 'https://auth-client-qa373h9zx-tochkasopryazheniya-gmailcom.vercel.app',
//     optionSuccessStatus:200
// }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://auth-client-qa373h9zx-tochkasopryazheniya-gmailcom.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
})


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(errorMiddleWare)

module.exports = app;
