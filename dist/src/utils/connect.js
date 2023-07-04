"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJSON = exports.readJSON = void 0;
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
dotenv.config();
// const dbUri = process.env.dbUri || "";
function readJSON() {
    try {
        const jsonString = fs.readFileSync('data/info.json', 'utf-8');
        const jsonData = JSON.parse(jsonString);
        return jsonData;
    }
    catch (err) {
        console.error(err);
    }
}
exports.readJSON = readJSON;
function writeJSON(obj) {
    const data = JSON.stringify(obj);
    try {
        // reading a JSON file synchronously
        fs.writeFileSync("data/info.json", data);
        console.log("Write JSON file successfully!");
    }
    catch (error) {
        // logging the error
        console.error(error);
        throw error;
    }
}
exports.writeJSON = writeJSON;
