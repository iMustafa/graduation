const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

passport.use(new LocalStrategy(
  async (email, password, done) => {
    try {
      const user = await User.findOne({email});
      if (!user) 
        return done(null, "User Not Found");

      const userPassword = user.password;
      const isPasswordCorrect = await bcrypt.compare(userPassword, password);

      if (isPasswordCorrect)
        return done(null, user);

      return done(null, "Incorrect Password");
    } catch(e) {
      return done(err); 
    }
  }
));
