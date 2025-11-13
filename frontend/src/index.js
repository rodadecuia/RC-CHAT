import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import App from "./App";
import { loadJSON } from "./helpers/loadJSON";
import { i18n } from "./translate/i18n";
import axios from "axios";

const config = loadJSON("/config.json");

if (!config) {
  window.renderError(i18n.t("frontendErrors.ERR_CONFIG_ERROR"));
} else {
  const protocol = config.BACKEND_PROTOCOL || "https";
  const configuredHost = config.BACKEND_HOST;
  const hostname = (!configuredHost || ["backend", "localhost", "127.0.0.1"].includes(configuredHost))
    ? window.location.hostname
    : configuredHost;
  const sameHost = hostname === window.location.hostname;
  // Não force a porta quando o host é o mesmo do site (usa 443/80 padrão)
  const port = (!sameHost && config.BACKEND_PORT) ? `:${config.BACKEND_PORT}` : "";
  const path = config.BACKEND_PATH || (sameHost ? "/backend" : "");

  const backendUrl = `${protocol}://${hostname}${port}${path}/?cb=${Date.now()}`;

  axios.get(backendUrl)
    .then((response) => {
      console.log(response);
      const serverDate = new Date(response.headers["date"]);
      const clientDate = new Date();
      const diff = Math.abs(serverDate - clientDate);
      const diffMinutes = Math.floor((diff / 1000) / 60);
      if (diffMinutes > 5) {
        let message = i18n.t("frontendErrors.ERR_CLOCK_OUT_OF_SYNC");
        message += `<br><br>Server time: ${serverDate.toLocaleString()}`;
        message += `<br>Client time: ${clientDate.toLocaleString()}`;
        message += `<br>difference: ${diffMinutes} minute(s)`;
        window.renderError(message);
        return;
      }

      ReactDOM.render(
        // <React.StrictMode>
        <CssBaseline>
          <App />
        </CssBaseline>
        // </React.StrictMode>
        ,
        document.getElementById("root"),
        () => {
          window.finishProgress();
        }
      );
    })
    .catch(() => {
      window.renderError(i18n.t("frontendErrors.ERR_BACKEND_UNREACHABLE"));
    });
}
