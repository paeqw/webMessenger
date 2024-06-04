const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Initialize Firebase Admin SDK
const serviceAccount = require('./webmessenger-7a32b-firebase-adminsdk-nft27-7eb5331d56.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'webmessenger-7a32b.appspot.com'
});
const bucket = getStorage().bucket();

const app = express();
app.use(cors()); // Enable CORS

const upload = multer({ dest: 'uploads/' }); // Temporary storage

app.post('/upload', upload.array('image', 9), async (req, res) => {
  try {
    const urls = await Promise.all(req.files.map(async (file) => {
      const filePath = file.path;
      const compressedFilePath = `uploads/compressed-${file.filename}.jpeg`;

      try {
        await sharp(filePath)
          .resize({ width: 800 })
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toFile(compressedFilePath);

        await bucket.upload(compressedFilePath, {
          destination: `images/${file.filename}.jpeg`,
          metadata: {
            contentType: 'image/jpeg',
          }
        });

        // Get the public URL
        const uploadedFile = bucket.file(`images/${file.filename}.jpeg`);
        const [url] = await uploadedFile.getSignedUrl({
          action: 'read',
          expires: '03-09-2491'
        });

        // Delete the temporary files
        fs.unlinkSync(filePath);
        fs.unlinkSync(compressedFilePath);

        return url;
      } catch (err) {
        console.error(`Error processing file ${file.filename}:`, err);
        throw err;
      }
    }));

    res.status(200).send({ imageUrls: urls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
