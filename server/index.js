import express from 'express';
import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import multiparty from 'multiparty';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv'
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));

const REGION = process.env.AWS_S3_REGION;
const s3Client = new S3Client({ region: REGION });

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


app.post('/file-upload', (request, response) => {
    const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
        if (error) {
            return response.status(500).send(error);
        };
        try {
            const path = files.file[0].path;
            const buffer = fs.readFileSync(path);
            const type = await fileTypeFromBuffer(buffer);
            const fileName = `bucketFolder/${Date.now().toString()}`;
            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `${fileName}.${type.ext}`,
                Body: buffer,
                ACL: 'public-read',
              };
            const uploadedImage = await s3Client.send(new PutObjectCommand(uploadParams));
            console.log(uploadedImage);
            return response.status(200).send(uploadedImage);
        } catch (err) {
            console.log(err);
            return response.status(500).send(err);
        }
    });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));