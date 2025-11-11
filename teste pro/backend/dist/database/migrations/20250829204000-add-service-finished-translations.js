"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const translationFunctions_1 = require("../translationFunctions");
const translationsMap = {
    en: {
        "Service finished": "Service finished"
    },
    de: {
        "Service finished": "Dienst beendet"
    },
    fr: {
        "Service finished": "Service terminé"
    },
    pt: {
        "Service finished": "Atendimento finalizado"
    },
    pt_PT: {
        "Service finished": "Atendimento finalizado"
    },
    id: {
        "Service finished": "Layanan selesai"
    },
    it: {
        "Service finished": "Servizio terminato"
    },
    es: {
        "Service finished": "Servicio finalizado"
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
