const express = require('express');
const session = require('express-session');
const { join } = require('path');
const { tripRouter } = require('./routes/tripRouter');
const { authenticationRoutes } = require('./routes/authentication');
const { userRoutes } = require('./routes/user');

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
app.use('/trips', tripRouter);

app.use('/', authenticationRoutes);
app.use('/users', userRoutes);

app.listen(process.env.APP_PORT, () =>
  console.log(`App started on port ${process.env.APP_PORT}!`)
);
