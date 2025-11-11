import axios from "axios";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface WhmcsApiParams {
  action: string;
  [key: string]: any; // Permite outros parâmetros específicos da ação
}

class WhmcsService {
  private readonly apiUrl: string;
  private readonly apiIdentifier: string;
  private readonly apiSecret: string;

  constructor() {
    if (
      !process.env.WHMCS_API_URL ||
      !process.env.WHMCS_API_IDENTIFIER ||
      !process.env.WHMCS_API_SECRET
    ) {
      logger.warn("WHMCS environment variables are not fully configured.");
      // Não lança erro para permitir que a aplicação funcione sem a integração
    }
    this.apiUrl = process.env.WHMCS_API_URL;
    this.apiIdentifier = process.env.WHMCS_API_IDENTIFIER;
    this.apiSecret = process.env.WHMCS_API_SECRET;
  }

  private isConfigured(): boolean {
    return !!(this.apiUrl && this.apiIdentifier && this.apiSecret);
  }

  public async execute(params: WhmcsApiParams): Promise<any> {
    if (!this.isConfigured()) {
      logger.debug("WHMCS integration is not configured. Skipping API call.");
      return null; // Retorna nulo se a integração não estiver configurada
    }

    const requestBody = {
      ...params,
      identifier: this.apiIdentifier,
      secret: this.apiSecret,
      responsetype: "json"
    };

    try {
      const response = await axios.post(this.apiUrl, new URLSearchParams(requestBody), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      if (response.data.result === "error") {
        throw new AppError(`WHMCS API Error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      logger.error({ err: error }, "Error calling WHMCS API");
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Could not connect to WHMCS API.");
    }
  }

  public async getClientByEmail(email: string): Promise<any> {
    if (!this.isConfigured()) return null;
    try {
      const response = await this.execute({
        action: "GetClients",
        search: email
      });
      if (response.result === "success" && response.clients.client.length > 0) {
        return response.clients.client[0];
      }
      return null;
    } catch (error) {
      logger.error({ err: error }, `Error getting WHMCS client by email: ${email}`);
      return null;
    }
  }

  public async getClientByPhoneNumber(phoneNumber: string): Promise<any> {
    if (!this.isConfigured()) return null;
    try {
      const response = await this.execute({
        action: "GetClients",
        search: phoneNumber
      });
      if (response.result === "success" && response.clients.client.length > 0) {
        return response.clients.client[0];
      }
      return null;
    } catch (error) {
      logger.error({ err: error }, `Error getting WHMCS client by phone number: ${phoneNumber}`);
      return null;
    }
  }

  public async addClient(
    name: string,
    email: string,
    phoneNumber: string
  ): Promise<any> {
    if (!this.isConfigured()) return null;
    try {
      const [firstName, ...lastNameParts] = name.split(" ");
      const lastName = lastNameParts.join(" ");

      const response = await this.execute({
        action: "AddClient",
        firstname: firstName,
        lastname: lastName || "N/A", // WHMCS pode exigir sobrenome
        email: email || `${phoneNumber}@rcchat.local`, // WHMCS exige email
        phonenumber: phoneNumber,
        password2: Math.random().toString(36).slice(-8) // Senha temporária
      });
      if (response.result === "success" && response.clientid) {
        return { id: response.clientid };
      }
      return null;
    } catch (error) {
      logger.error({ err: error }, `Error adding WHMCS client: ${name}`);
      return null;
    }
  }
}

export default new WhmcsService();
