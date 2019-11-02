const express = require('express');
const session = require('express-session');
const { join } = require('path');

const { requireAuthentication } = require('./middlewares/authentication');

const { authenticationRoutes } = require('./routes/authentication');
const { userRoutes } = require('./routes/user');
const { tripRoutes } = require('./routes/trip');
const { carRoutes } = require('./routes/car');
const { messageRoutes } = require('./routes/message');
const { driverRoutes } = require('./routes/driver');

const { pageRoutes } = require('./routes/page');

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

// Permanent redirection
app.get('/', (req, res) => {
  res.status(301).redirect('/p/trips');
});

// Authentication
app.use('/api', authenticationRoutes);
<<<<<<< HEAD
// app.use(requireAuthentication);
=======
app.use(requireAuthentication);
>>>>>>> Use page route

app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/drivers', driverRoutes);

app.use('/p', pageRoutes);

app.listen(process.env.APP_PORT, () =>
  console.log(`App started on port ${process.env.APP_PORT}!`)
);
