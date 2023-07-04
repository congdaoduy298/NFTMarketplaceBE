import mongoose from "mongoose";
import * as dotenv from "dotenv";
import logger from "./logger"
import * as fs from 'fs';

dotenv.config()
// const dbUri = process.env.dbUri || "";

export function readJSON() {
    try {
        const jsonString = fs.readFileSync('data/info.json', 'utf-8');
        const jsonData = JSON.parse(jsonString);
        return jsonData;
      } catch (err) {
        console.error(err);
      }
  }

export function writeJSON(obj: JSON) {
  const data = JSON.stringify(obj);

  try {
    // reading a JSON file synchronously
    fs.writeFileSync("data/info.json", data);
    console.log("Write JSON file successfully!")
  } catch (error) {
    // logging the error
    console.error(error);
  
    throw error;
  }
  }