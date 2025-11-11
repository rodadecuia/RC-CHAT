"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const sequelize_1 = require("sequelize");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbConfig = require("../config/database");
const sequelize = new sequelize_1.Sequelize(dbConfig);
const seedsDir = "dist/database/seeds";
function getSeedFiles() {
    return fs_1.default.readdirSync(seedsDir).filter(file => file.endsWith(".js"));
}
async function markSeedsAsExecuted() {
    const seedFiles = getSeedFiles();
    if (seedFiles.length === 0) {
        console.log("No seed files found in the seeds directory.");
        return;
    }
    console.log(`Found ${seedFiles.length} seed files. Marking them as executed...`);
    try {
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeData" (
        "name" VARCHAR(255),
        PRIMARY KEY ("name")
      )
    `);
        await sequelize.query(`INSERT INTO "SequelizeData" (name) VALUES ${seedFiles
            .map(seed => `('${seed}')`)
            .join(", ")}`);
        console.log("All seeds marked as executed successfully!");
    }
    catch (error) {
        console.error("Error marking seeds as executed:", error);
    }
    finally {
        await sequelize.close();
    }
}
markSeedsAsExecuted();
