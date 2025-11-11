import Company from "../../models/Company";
import Plan from "../../models/Plan";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import moment from "moment";

interface ProvisionData {
  whmcsClientId: number;
  whmcsProductId: number;
  whmcsStatus: "Active" | "Suspended" | "Terminated" | "Fraud";
  companyName?: string;
}

const ProvisionWhmcsService = async ({
  whmcsClientId,
  whmcsProductId,
  whmcsStatus,
  companyName
}: ProvisionData): Promise<void> => {
  const company = await Company.findOne({
    where: { whmcsClientId }
  });

  if (!company) {
    logger.warn(`WHMCS Webhook: Company with WHMCS Client ID ${whmcsClientId} not found. Attempting to create.`);
    // Se a companhia não existir, podemos tentar criá-la aqui
    // ou simplesmente logar e sair, dependendo da regra de negócio.
    // Por enquanto, vamos apenas logar e sair.
    throw new AppError(`Company with WHMCS Client ID ${whmcsClientId} not found.`);
  }

  const plan = await Plan.findOne({
    where: { whmcsProductId }
  });

  if (!plan) {
    logger.warn(`WHMCS Webhook: Plan with WHMCS Product ID ${whmcsProductId} not found.`);
    throw new AppError(`Plan with WHMCS Product ID ${whmcsProductId} not found.`);
  }

  let rcChatStatus = company.status;
  let newDueDate = company.dueDate;

  switch (whmcsStatus) {
    case "Active":
      rcChatStatus = true;
      // Se o plano for ativado, podemos estender a data de vencimento
      // Por exemplo, adicionar 1 mês à data atual ou à data de vencimento existente
      newDueDate = moment().add(1, "month").format("YYYY-MM-DD"); // Exemplo: adiciona 1 mês
      break;
    case "Suspended":
    case "Terminated":
    case "Fraud":
      rcChatStatus = false;
      break;
    default:
      break;
  }

  await company.update({
    planId: plan.id,
    status: rcChatStatus,
    dueDate: newDueDate,
    name: companyName || company.name // Atualiza o nome se um novo for fornecido
  });

  logger.info(
    `WHMCS Webhook: Company ${company.id} (Client ID: ${whmcsClientId}) updated. ` +
    `Plan: ${plan.name}, Status: ${rcChatStatus}, DueDate: ${newDueDate}.`
  );
};

export default ProvisionWhmcsService;
