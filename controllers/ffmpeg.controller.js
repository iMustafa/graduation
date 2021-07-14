const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const outStream = (path) => fs.createWriteStream("");

exports.encodeFiles = async (req, res, next) => {
  const { repeat, verify } = req.files;
  repeat.forEach((file) => {
    ffmpeg(fs.createReadStream(process.env.FFMPEG_PATH + "/" + file.filename))
      .outputOptions(["-ar 16000"])
      .on("error", (e) => {
        console.log(e)
      })
      .on("end", (_) => {
        console.log('end')
        next();
      })
      .pipe(
        fs.createWriteStream(`${process.env.FFMPEG_PATH}/${file.filename}`, {
          end: true,
        })
      );
  });
  // ffmpeg(fs.createReadStream(verify.path))
  //   .outputOptions(["-ar 16000"])
  //   .on("error", (e) => {
  //     console.log(e);
  //   })
  //   .on("end", (_) => {
  //     next();
  //   })
  //   .pipe(
  //     fs.createWriteStream(`./uploads/${verify.filename}`, {
  //       end: true,
  //     })
  //   );
};
