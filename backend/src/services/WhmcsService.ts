import axios from "axios";
import { logger } from "../utils/logger";

// Função auxiliar para encapsular as chamadas à API do WHMCS
async function callWhmcsApi(action: string, params: any): Promise<any> {
  // Constrói o corpo da requisição com os parâmetros necessários
  const apiConfig = {
    action,
    ...params,
    identifier: process.env.WHMCS_API_IDENTIFIER,
    secret: process.env.WHMCS_API_SECRET,
    responsetype: "json",
  };

  try {
    const response = await axios.post(process.env.WHMCS_API_URL, apiConfig, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // A API do WHMCS retorna result = "error" em caso de falha
    if (response.data.result === "error") {
      throw new Error(response.data.message || "Unknown WHMCS API error");
    }
    return response.data;
  } catch (error) {
    logger.error({ err: error.message }, "WHMCS API call failed");
    // Lança o erro para ser tratado pelo controller
    throw new Error(`WHMCS API Error: ${error.message}`);
  }
}

/**
 * Valida as credenciais de um cliente final contra a API do WHMCS.
 * Verifica se o cliente existe, se possui o produto RC-CHAT ativo e se a senha do serviço está correta.
 * @param email O e-mail do cliente.
 * @param servicePassword A senha do produto/serviço específico.
 * @returns Um objeto com o ID do cliente e o ID do produto se a validação for bem-sucedida.
 */
export async function validateClientProductLogin(
  email: string,
  servicePassword?: string
): Promise<{ clientId: number; productId: number }> {

  // Passo 1: Obter os detalhes do cliente pelo e-mail
  logger.info(`[WHMCS] Validating login for email: ${email}`);
  const clientData = await callWhmcsApi("GetClientsDetails", { email });
  if (!clientData || !clientData.client) {
    throw new Error("Client not found in WHMCS");
  }
  const clientId = clientData.client.userid;
  logger.info(`[WHMCS] Client found with ID: ${clientId}`);

  // Passo 2: Obter os produtos/serviços do cliente
  const productsData = await callWhmcsApi("GetClientsProducts", {
    clientid: clientId,
  });

  if (!productsData.products || !productsData.products.product) {
    throw new Error("No products found for this client");
  }

  // Garante que products.product seja sempre um array
  const products = Array.isArray(productsData.products.product)
    ? productsData.products.product
    : [productsData.products.product];

  // Passo 3: Encontrar o produto/serviço específico do RC-CHAT que esteja ativo
  const rcChatProductId = process.env.WHMCS_PRODUCT_ID;
  if (!rcChatProductId) {
    throw new Error("WHMCS_PRODUCT_ID is not configured in .env");
  }

  const rcChatProduct = products.find(
    (p: any) => p.pid.toString() === rcChatProductId.toString() && p.status === "Active"
  );

  if (!rcChatProduct) {
    throw new Error("Active RC-CHAT service not found for this client");
  }
  logger.info(`[WHMCS] Active product found for client ${clientId} with service ID: ${rcChatProduct.id}`);

  // Passo 4: Validar a senha do serviço
  // A API do WHMCS retorna a senha descriptografada, então a comparação direta funciona.
  if (rcChatProduct.password !== servicePassword) {
    throw new Error("Invalid service password");
  }

  logger.info(`[WHMCS] Service password validated successfully for client ${clientId}`);
  return { clientId: clientId, productId: rcChatProduct.id };
}
