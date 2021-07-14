const User = require("../models/user.model");
const { TextDependentVerification } = require('../helpers/azure')

exports.registerVoice = async (req, res, next) => {
  const user_id = req.user._id;
  try {
    const profile = await TextDependentVerification(req.files['repeat'], req.files['verify'][0])
    req.body.profileId = profile.profileId
    next();
  } catch (e) {
    req.status(500).json(e);
  }
};
