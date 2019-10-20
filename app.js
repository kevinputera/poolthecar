const express = require('express');
const { join } = require('path');
const { tripRouter } = require('./routes/tripRouter');

// Load env variables
require('dotenv').config({ path: join(__dirname, '.env') });

const app = express();
app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use('/trips', tripRouter);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(process.env.APP_PORT, () =>
  console.log(`App started on port ${process.env.APP_PORT}!`)
);
