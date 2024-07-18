import 'dotenv/config';
import { admin } from '../../server.js';
import { Readable } from 'stream';

const commonController = {};

// * Function to upload file to firebase storage
// ? Function Parameters:
// @param file - The file to be uploaded (form-data)
// @param folderPath - The folder path in the container
commonController.uploadFileToFirebase = async (file, folderPath) => {
    const storageRef = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);

    console.log(storageRef.name);
    const fileStream = Readable.from(file.buffer);

    // creating a unique name using data and time
    const uniqueName = `${Date.now()}-${file.originalname}`;

    const fileUpload = storageRef.file(`${folderPath}/${uniqueName}`);

    const writeStream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype
        }
    });

    return new Promise((resolve, reject) => {
        fileStream
            .pipe(writeStream)
            .on('error', (err) => {
                console.log('Error uploading file: ', err);
                reject(err);
            })
            .on('finish', async () => {
                try {
                    await fileUpload.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${storageRef.name}/${fileUpload.name}`;
                    resolve({ publicUrl, fileName: fileUpload.name });
                } catch (error) {
                    reject(error);
                }
            });
    });
};

// * Function to delete file from firebase storage
// ? Function Parameters:
// @param filePath - The path of the file to be deleted
commonController.deleteFileFromFirebase = async (filePath) => {
    const storageRef = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const file = storageRef.file(filePath);

    return new Promise((resolve, reject) => {
        file.delete()
            .then(() => {
                resolve();
            })
            .catch((err) => {
                console.log('Error deleting file: ', err);
                reject(err);
            });
    });
};

// ? Export the commonController object
export { commonController };