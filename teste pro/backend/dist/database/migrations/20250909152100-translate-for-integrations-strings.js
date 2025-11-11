"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const translationFunctions_1 = require("../translationFunctions");
const translationsMap = {
    en: {
        "Invalid message. Please, try again.": "Invalid message. Please, try again.",
        "Send Template:": "Send Template:",
        "Choose an option": "Choose an option",
        Options: "Options"
    },
    de: {
        "Invalid message. Please, try again.": "Ungültige Nachricht. Bitte versuchen Sie es erneut.",
        "Send Template:": "Vorlage senden:",
        "Choose an option": "Wählen Sie eine Option",
        Options: "Optionen"
    },
    fr: {
        "Invalid message. Please, try again.": "Message invalide. Veuillez réessayer.",
        "Send Template:": "Envoyer le modèle&nbsp;:",
        "Choose an option": "Choisissez une option",
        Options: "Options"
    },
    pt: {
        "Invalid message. Please, try again.": "Mensagem inválida. Por favor, tente novamente.",
        "Send Template:": "Enviar modelo:",
        "Choose an option": "Escolha uma opção",
        Options: "Opções"
    },
    pt_PT: {
        "Invalid message. Please, try again.": "Mensagem inválida. Por favor, tente novamente.",
        "Send Template:": "Enviar modelo:",
        "Choose an option": "Escolha uma opção",
        Options: "Opções"
    },
    id: {
        "Invalid message. Please, try again.": "Pesan tidak valid. Silakan coba lagi.",
        "Send Template:": "Kirim Template:",
        "Choose an option": "Pilih opsi",
        Options: "Opsi"
    },
    it: {
        "Invalid message. Please, try again.": "Messaggio non valido. Per favore, riprova.",
        "Send Template:": "Invia modello:",
        "Choose an option": "Scegli un'opzione",
        Options: "Opzioni"
    },
    es: {
        "Invalid message. Please, try again.": "Mensaje inválido. Por favor, inténtalo de nuevo.",
        "Send Template:": "Enviar plantilla:",
        "Choose an option": "Elige una opción",
        Options: "Opciones"
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
