"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const MakeRandomId_1 = require("../helpers/MakeRandomId");
const publicFolder = __dirname.endsWith("/dist")
    ? path_1.default.resolve(__dirname, "..", "public")
    : path_1.default.resolve(__dirname, "..", "..", "public");
exports.default = {
    directory: publicFolder,
    limits: {
        fileSize: 500 * 1024 * 1024
    },
    storage: multer_1.default.diskStorage({
        destination: publicFolder,
        filename(_req, file, cb) {
            const fileName = `${(0, MakeRandomId_1.makeRandomId)(5)}-${path_1.default.basename(file.originalname.replace(/ /g, "_"))}`;
            return cb(null, fileName);
        }
    })
};
