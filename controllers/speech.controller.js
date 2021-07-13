const User = require("../models/user.model");
const AzureHelper = require('../helpers/azure');

exports.registerVoice = async (req, res, next) => {
  const user_id = req.user._id;

  try {
    await
    next();
  } catch (e) {
    req.status(500).json(e);
  }
};
