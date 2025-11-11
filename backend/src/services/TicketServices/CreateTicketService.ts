import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";
import { getIO } from "../../libs/socket";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import Contact from "../../models/Contact";
import { incrementCounter } from "../CounterServices/IncrementCounter";
import WhmcsService from "../WhmcsServices/WhmcsService";
import { logger } from "../../utils/logger";

interface Request {
  contactId: number;
  userId: number;
  companyId: number;
  queueId?: number;
}

const CreateTicketService = async ({
  contactId,
  userId,
  queueId,
  companyId
}: Request): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  await CheckContactOpenTickets(contactId, defaultWhatsapp.id);

  const contact = await ShowContactService(contactId, companyId);
  const { isGroup } = contact;

  // Início da Integração WHMCS para Cliente e Ticket
  let whmcsClientId = contact.whmcsClientId;
  if (!whmcsClientId) {
    try {
      let whmcsClient = null;
      if (contact.email) {
        whmcsClient = await WhmcsService.getClientByEmail(contact.email);
      }
      if (!whmcsClient && contact.number) {
        whmcsClient = await WhmcsService.getClientByPhoneNumber(contact.number);
      }

      if (!whmcsClient) {
        whmcsClient = await WhmcsService.addClient(
          contact.name,
          contact.email,
          contact.number
        );
      }

      if (whmcsClient && whmcsClient.id) {
        whmcsClientId = whmcsClient.id;
        await contact.update({ whmcsClientId });
        logger.info(`WHMCS Client ID ${whmcsClientId} associado ao contato ${contact.name}.`);
      }
    } catch (error) {
      logger.error({ err: error }, "Falha ao buscar/criar cliente no WHMCS.");
    }
  }
  // Fim da busca/criação de cliente WHMCS

  const ticket = await Ticket.create({
    contactId,
    companyId,
    queueId,
    whatsappId: defaultWhatsapp.id,
    status: "open",
    isGroup,
    userId
  });

  try {
    if (whmcsClientId) {
      const whmcsTicket = await WhmcsService.execute({
        action: "OpenTicket",
        clientid: whmcsClientId,
        subject: `Atendimento RC-CHAT: ${contact.name}`,
        message: `Ticket iniciado por ${contact.name} (${contact.number}).`,
        priority: "Medium"
      });

      if (whmcsTicket && whmcsTicket.tid) {
        await ticket.update({ whmcsTicketId: whmcsTicket.tid });
        logger.info(`Ticket do WHMCS criado com ID: ${whmcsTicket.tid} para o cliente ${whmcsClientId}.`);
      }
    } else {
      logger.warn(`WHMCS Client ID não encontrado para o contato ${contact.name}. Ticket não será aberto no WHMCS.`);
    }
  } catch (error) {
    logger.error({ err: error }, "Falha ao criar ticket no WHMCS.");
  }
  // Fim da Integração WHMCS para Ticket

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  await FindOrCreateATicketTrakingService({
    ticketId: ticket.id,
    companyId: ticket.companyId,
    whatsappId: ticket.whatsappId,
    userId: ticket.userId
  });

  incrementCounter(ticket.companyId, "ticket-create");

  await ticket.reload({
    include: [
      {
        model: Contact,
        as: "contact",
        include: ["tags", "extraInfo"]
      },
      "queue",
      "whatsapp",
      "user",
      "tags"
    ]
  });

  const io = getIO();

  io.to(ticket.id.toString()).emit("ticket", {
    action: "update",
    ticket
  });

  return ticket;
};

export default CreateTicketService;
