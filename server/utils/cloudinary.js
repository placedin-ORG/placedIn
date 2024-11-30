const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const uploadFile = async (buffer, folder = "user/uploads/placedIn") => {
  try {
    return new Promise((resolve, reject) => {
      const cld_upload_stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: folder,
        },
        (error, result) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            // console.log(result);
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { uploadFile };
