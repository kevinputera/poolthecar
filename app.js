const express = require('express');
const session = require('express-session');
const { join } = require('path');

const { requireAuthentication } = require('./middlewares/authentication');

const { authenticationRoutes } = require('./routes/authentication');
const { userRoutes } = require('./routes/user');
const { tripRouter } = require('./routes/tripRouter');

// Load env variables
require('dotenv').config({ path: join(__dirname, '.env') });

const app = express();

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.urlencoded({ extended: false }));

// Authentication
app.use('/', authenticationRoutes);
app.use(requireAuthentication);

app.use('/users', userRoutes);
app.use('/trips', tripRouter);

app.listen(process.env.APP_PORT, () =>
  console.log(`App started on port ${process.env.APP_PORT}!`)
);
