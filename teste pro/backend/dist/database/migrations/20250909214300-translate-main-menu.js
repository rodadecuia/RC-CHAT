"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const translationFunctions_1 = require("../translationFunctions");
const translationsMap = {
    en: {
        "Main Menu": "Main Menu"
    },
    de: {
        "Main Menu": "Hauptmenü"
    },
    fr: {
        "Main Menu": "Menu Principal"
    },
    pt: {
        "Main Menu": "Menu Principal"
    },
    pt_PT: {
        "Main Menu": "Menu Principal"
    },
    id: {
        "Main Menu": "Menu Utama"
    },
    it: {
        "Main Menu": "Menu Principale"
    },
    es: {
        "Main Menu": "Menú Principal"
    }
};
exports.default = {
    up: async (queryInterface) => {
        return (0, translationFunctions_1.translationsUp)(translationsMap, queryInterface);
    },
    down: async (queryInterface) => {
        return (0, translationFunctions_1.translationsDown)(translationsMap, queryInterface);
    }
};
