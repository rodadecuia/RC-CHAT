"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translationsDown = translationsDown;
exports.translationsUp = translationsUp;
const sequelize_1 = require("sequelize");
async function translationsDown(translationsMap, queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        const deletionCriteria = Object.entries(translationsMap).map(([language, keys]) => ({
            language,
            key: { [sequelize_1.Op.in]: Object.keys(keys) }
        }));
        await queryInterface.bulkDelete("Translations", {
            namespace: "backend",
            [sequelize_1.Op.or]: deletionCriteria
        }, { transaction });
        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
}
async function translationsUp(translationsMap, queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        // make sure we clear the existing translations first
        await translationsDown(translationsMap, queryInterface);
        const translations = [];
        Object.entries(translationsMap).forEach(([language, keys]) => {
            Object.entries(keys).forEach(([key, value]) => {
                translations.push({
                    language,
                    namespace: "backend",
                    key,
                    value
                });
            });
        });
        // eslint-disable-next-line no-restricted-syntax
        for await (const translation of translations) {
            await queryInterface.bulkInsert("Translations", [translation], {
                transaction
            });
        }
        await transaction.commit();
    }
    catch (error) {
        console.error("Error inserting translations:", JSON.stringify(error, null, 2));
        await transaction.rollback();
        throw error;
    }
}
