const express = require('express');
const session = require('express-session');
const { join } = require('path');

const { requireAuthentication } = require('./middlewares/authentication');

const { authenticationPageRoutes } = require('./routes/page/authentication');
const { accountPageRoutes } = require('./routes/page/account');
const { tripPageRoutes } = require('./routes/page/trip');

const { authenticationRoutes } = require('./routes/api/authentication');
const { userRoutes } = require('./routes/api/user');
const { tripRoutes } = require('./routes/api/trip');
const { carRoutes } = require('./routes/api/car');
const { messageRoutes } = require('./routes/api/message');
const { driverRoutes } = require('./routes/api/driver');

const { permanentRedirect } = require('./utils/response');

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
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// Permanent redirection from / to /p/trips
app.get('/', (req, res) => {
  permanentRedirect(res, '/p/trips');
});

// Authentication
app.use('/p/auth', authenticationPageRoutes);
app.use('/api', authenticationRoutes);

// Block of all the routes below from unauthenticated users
app.use(requireAuthentication);

app.use('/p/account', accountPageRoutes);
app.use('/p/trips', tripPageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/drivers', driverRoutes);

app.listen(process.env.APP_PORT, () =>
  console.log(`App started on port ${process.env.APP_PORT}!`)
);
