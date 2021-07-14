const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");

const speech_config = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_KEY,
  "westus"
);
const profile_locale = "en-us";

const client = new sdk.VoiceProfileClient(speech_config);
async function SpeakerVerify(profileId, verify_file) {
  const profile = new sdk.VoiceProfile(profileId, 1)

  const audio_config = GetAudioConfigFromFile(verify_file);
  const recognizer = new sdk.SpeakerRecognizer(speech_config, audio_config);

  const model = sdk.SpeakerVerificationModel.fromProfile(profile);
  const result = await new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      model,
      (verificationResult) => {
        const reason = verificationResult.reason;
        console.log(
          "(Verification result) Reason: " + sdk.ResultReason[reason]
        );
        if (reason === sdk.ResultReason.Canceled) {
          const cancellationDetails = sdk.SpeakerRecognitionCancellationDetails.fromResult(
            verificationResult
          );
          console.log(
            "(Verification canceled) Error Details: " +
              cancellationDetails.errorDetails
          );
          console.log(
            "(Verification canceled) Error Code: " +
              cancellationDetails.errorCode
          );
          reject(cancellationDetails)
        } else {
          console.log(
            "(Verification result) Profile Id: " + verificationResult.profileId
          );
          console.log(
            "(Verification result) Score: " + verificationResult.score
          );
          resolve(verificationResult)
        }
      },
      (error) => reject(error)
    );
  });
  return result
}
function GetAudioConfigFromFile(file) {
  let pushStream = sdk.AudioInputStream.createPushStream();
  fs.createReadStream(file)
    .on("data", function(arrayBuffer) {
      pushStream.write(arrayBuffer.buffer);
    })
    .on("end", function() {
      pushStream.close();
    });
  return sdk.AudioConfig.fromStreamInput(pushStream);
}

async function AddEnrollmentsToTextDependentProfile(profileId, audio_files) {
  const profile = new sdk.VoiceProfile(profileId, 1)
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

async function TextDependentVerification(passphrase_files, verify_file) {
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
    await AddEnrollmentsToTextDependentProfile(profile.profileId, passphrase_files);
    await SpeakerVerify(profile.profileId, verify_file);
  } catch (error) {
    throw error
  } finally {
    // if (profile !== null) {
    //   console.log("Deleting profile ID: " + profile.profileId);
    //   await new Promise((resolve, reject) => {
    //     client.deleteProfileAsync(
    //       profile,
    //       (result) => {
    //         resolve(result);
    //       },
    //       (error) => {
    //         reject(error);
    //       }
    //     );
    //   });
    // }
  }
  return profile
}

module.exports = {
  SpeakerVerify,
  TextDependentVerification,
};
