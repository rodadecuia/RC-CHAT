import axios from "axios";
import { logger } from "../utils/logger";
import Plan from "../models/Plan";
import { Op } from "sequelize";

// Função auxiliar para encapsular as chamadas à API do WHMCS
async function callWhmcsApi(action: string, params: any): Promise<any> {
  const apiConfig = {
    action,
    ...params,
    identifier: process.env.WHMCS_API_IDENTIFIER,
    secret: process.env.WHMCS_API_SECRET,
    responsetype: "json",
  };

  try {
    // WHMCS espera receber os parâmetros como application/x-www-form-urlencoded.
    // Enviar JSON aqui pode causar 403/401 dependendo da configuração do servidor.
    const formBody = new URLSearchParams(apiConfig as Record<string, string>);

    const response = await axios.post(process.env.WHMCS_API_URL, formBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      // Evita ficar travado caso a API esteja indisponível
      timeout: 15000
    });

    if (response.data.result === "error") {
      throw new Error(response.data.message || "Unknown WHMCS API error");
    }
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message || error?.message || "Unknown error";
    logger.error({ err: msg, status }, "WHMCS API call failed");
    throw new Error(`WHMCS API Error: ${msg}${status ? ` (HTTP ${status})` : ""}`);
  }
}

/**
 * Valida as credenciais de um cliente final contra a API do WHMCS.
 * Esta nova versão é mais flexível e não depende de um WHMCS_PRODUCT_ID fixo.
 * @param email O e-mail do cliente.
 * @param servicePassword A senha do produto/serviço específico.
 * @returns Um objeto com o ID do cliente e o ID do produto do WHMCS se a validação for bem-sucedida.
 */
export async function validateClientProductLogin(
  email: string,
  servicePassword?: string
): Promise<{ clientId: number; productId: number }> {

  logger.info(`[WHMCS] Starting validation for email: ${email}`);

  // Passo 1: Obter os detalhes do cliente pelo e-mail
  const clientData = await callWhmcsApi("GetClientsDetails", { email });
  if (!clientData || !clientData.client) {
    throw new Error("Client not found in WHMCS");
  }
  const clientId = clientData.client.userid;
  logger.info(`[WHMCS] Client found with ID: ${clientId}`);

  // Passo 2: Obter os produtos/serviços do cliente
  const productsData = await callWhmcsApi("GetClientsProducts", {
    clientid: clientId,
    status: "Active" // Filtramos apenas por serviços ativos
  });

  if (!productsData.products || !productsData.products.product) {
    throw new Error("No active products found for this client");
  }

  const clientProducts = Array.isArray(productsData.products.product)
    ? productsData.products.product
    : [productsData.products.product];

  // Passo 3: Buscar no RC-CHAT todos os planos que têm um mapeamento com o WHMCS
  const mappedPlans = await Plan.findAll({
    where: { whmcsProductId: { [Op.not]: null } },
    attributes: ["id", "whmcsProductId"]
  });

  if (mappedPlans.length === 0) {
    throw new Error("No plans in RC-CHAT are mapped to WHMCS products.");
  }

  // Passo 4: Iterar sobre os produtos do cliente e encontrar uma correspondência
  for (const product of clientProducts) {
    // Verifica se o produto do cliente corresponde a algum plano mapeado no RC-CHAT
    const isProductMapped = mappedPlans.some(plan => plan.whmcsProductId === product.pid);

    if (isProductMapped) {
      // Encontramos um produto ativo e mapeado. Agora, validamos a senha.
      if (product.password === servicePassword) {
        logger.info(`[WHMCS] Login success for client ${clientId} with product ID: ${product.pid}`);
        // Retornamos o ID do produto do WHMCS (pid) para a sincronização de planos
        return { clientId: clientId, productId: product.pid };
      }
    }
  }

  // Se o loop terminar e nenhuma senha bater, ou nenhum produto for mapeado
  throw new Error("No active, mapped product with a matching password was found.");
}
