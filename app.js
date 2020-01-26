require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const checkToken = require('./middleware/jwt');
const isAdmin = require('./middleware/isAdmin');

const app = express();

// middleware
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cors());
app.use(morgan('dev'));
app.use(checkToken);
app.use(express.static(`${__dirname}/public`));

// routers
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const citiesRouter = require('./routes/cities');

// routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/cities', citiesRouter);
app.use('/admin', isAdmin, adminRouter);

const server = http.createServer(app);

module.exports = server;
