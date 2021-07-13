const ffmpeg = require("ffmpeg");
const fs = require("fs");

const outStream = (path) => fs.createWriteStream("");

exports.encodeFiles = async (req, res, next) => {
  const { repeat, verify } = req.files;
  const user_id = req.user._id;

  // Itirate
  ffmpeg(fs.createReadStream(`/public/${user_id}/${repeat[0].filename}`))
    .outputOptions(["-ar 16000"])
    .on("error", (e) => {
      console.log(e);
    })
    .on("end", (_) => {
      next();
    })
    .pipe(
      fs.createWriteStream(`/public/${user_id}/sampled/${repeat[0].filename}`, {
        end: true,
      })
    );
};
