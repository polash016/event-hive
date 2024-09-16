"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const multer_1 = __importDefault(require("multer"));
// import path from 'path'
// import fs from 'fs'
const cloudinary_1 = require("cloudinary");
// import { ICloudinaryResponse, IFile } from "../app/interfaces/file";
cloudinary_1.v2.config({
    cloud_name: 'dbgrq28js',
    api_key: '173484379744282',
    api_secret: 'eHKsVTxIOLl5oaO_BHxBQWAK3GA',
});
const storage = multer_1.default.memoryStorage();
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'uploads'
//   }
// });
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(process.cwd(), 'uploads'))
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   },
// })
// const uploadToCloudinary = async (
//   file: IFile,
// ): Promise<ICloudinaryUploadResponse | undefined> => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       file.path,
//       // {public_id: file.originalname},
//       (error: Error, result: ICloudinaryUploadResponse) => {
//         fs.unlinkSync(file.path)
//         if (error) {
//           reject(error)
//         } else {
//           resolve(result)
//         }
//       },
//     )
//   })
// }
const upload = (0, multer_1.default)({ storage: storage });
const uploadToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader
            .upload_stream(
        // { folder: 'uploads' }, // Optional: specify Cloudinary folder
        (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        })
            .end(file.buffer); // Use file.buffer to upload from memory
    });
});
const uploadFilesToCloudinary = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    return Promise.all(uploadPromises);
});
exports.fileUploader = {
    upload,
    uploadToCloudinary,
    uploadFilesToCloudinary,
};
