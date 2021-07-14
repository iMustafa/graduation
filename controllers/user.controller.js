const User = require('../models/user.model');
const bycrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    const {email, password, profileId} = req.body;
    const hashedPassword = await bycrypt.hash(password, 10);
    const user = new User({email, password: hashedPassword, profileId});

    await user.save();

    res.status(200).json(user);
  } catch(e) {
    res.status(500).json(e?.message);
  }
}
