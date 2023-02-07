const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const errorMiddleWare = require('./middleware/error-middleware')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const PouchDB = require("pouchdb");

const app = express();
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

const users = new PouchDB('datalake/users');
const tokens = new PouchDB('datalake/tokens');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(errorMiddleWare)

module.exports = app;
