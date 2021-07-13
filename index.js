require('dotenv').config()
const express = require('express');
const passport = require('passport');
const mongo = require('./models/mongo');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());
require("./auth/passport-local");

app.use('/auth', require('./routes/user.routes'));

app.listen(PORT, async _ => {
  console.log(`App is running on port ${PORT}`);
  await mongo.connect();
});