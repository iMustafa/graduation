const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");

const speech_config = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_KEY,
  process.env.AZURE_REGION
);

const client = new sdk.VoiceProfileClient(speech_config);

function GetAudioConfigFromFile(file) {
  let pushStream = sdk.AudioInputStream.createPushStream();
  fs.createReadStream(file)
    .on("data", function (arrayBuffer) {
      pushStream.write(arrayBuffer.buffer);
    })
    .on("end", function () {
      pushStream.close();
    });
  return sdk.AudioConfig.fromStreamInput(pushStream);
}

async function AddEnrollmentsToTextDependentProfile(profile, audio_files) {
  for (var i = 0; i < audio_files.length; i++) {
    console.log("Adding enrollment to text dependent profile...");
    const audio_config = GetAudioConfigFromFile(audio_files[i]);
    const result = await new Promise((resolve, reject) => {
      client.enrollProfileAsync(
        profile,
        audio_config,
        (result) => {
          resolve(result);
        },
        (error) => {
          reject(error);
        }
      );
    });
    if (result.reason === sdk.ResultReason.Canceled) {
      throw JSON.stringify(
        sdk.VoiceProfileEnrollmentCancellationDetails.fromResult(result)
      );
    } else {
      console.log(
        "Remaining enrollments needed: " +
          result.privDetails["remainingEnrollmentsCount"] +
          "."
      );
    }
  }
  console.log("Enrollment completed.\n");
}

async function TextDependentVerification(client, speech_config) {
  console.log("Text Dependent Verification:\n");
  var profile = null;
  try {
    // Create the profile.
    profile = await new Promise((resolve, reject) => {
      client.createProfileAsync(
        sdk.VoiceProfileType.TextDependentVerification,
        profile_locale,
        (result) => {
          resolve(result);
        },
        (error) => {
          reject(error);
        }
      );
    });
    console.log("Created profile ID: " + profile.profileId);
    await AddEnrollmentsToTextDependentProfile(
      client,
      profile,
      passphrase_files
    );
    const audio_config = GetAudioConfigFromFile(verify_file);
    const recognizer = new sdk.SpeakerRecognizer(speech_config, audio_config);
    await SpeakerVerify(profile, recognizer);
  } catch (error) {
    console.log("Error:\n" + error);
  } finally {
    if (profile !== null) {
      console.log("Deleting profile ID: " + profile.profileId);
      await new Promise((resolve, reject) => {
        client.deleteProfileAsync(
          profile,
          (result) => {
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
      });
    }
  }
}

module.exports = {
  GetAudioConfigFromFile,
  AddEnrollmentsToTextDependentProfile,
};
