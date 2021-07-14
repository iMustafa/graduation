const express = require("express");
const passport = require("passport");
const multer = require("multer");
const userController = require("../controllers/user.controller");
const speechController = require("../controllers/speech.controller");
const ffmpegController = require("../controllers/ffmpeg.controller");
const api = express.Router();
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/user_1"); //you tell where to upload the files,
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  onFileUploadStart: function(file) {
    console.log(file.originalname + " is starting ...");
  },
});

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

api.post("/signin", passport.authenticate("local"));

//  req.files['repeat'] -> Array
//  req.files['verify'][0] -> Verification Fiel
api.post(
  "/signup",
  upload.fields([
    { name: "repeat", maxCount: 3 },
    { name: "verify", maxCount: 1 },
  ]),
  use(ffmpegController.encodeFiles),
  use(speechController.registerVoice),
  use(userController.signup)
);

module.exports = api;
