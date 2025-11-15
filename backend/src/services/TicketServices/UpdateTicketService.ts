import moment from "moment";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import { startQueue, verifyMessage } from "../WbotServices/wbotMessageListener";
import AppError from "../../errors/AppError";
import { GetCompanySetting } from "../../helpers/CheckSettings";
import User from "../../models/User";
import formatBody from "../../helpers/Mustache";
import { logger } from "../../utils/logger";
import { incrementCounter } from "../CounterServices/IncrementCounter";
import { getJidOf } from "../WbotServices/getJidOf";
import Queue from "../../models/Queue";
import { _t } from "../TranslationServices/i18nService";
import WhmcsService from "../WhmcsServices/WhmcsService";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import CreatePrivateMessageService from "../MessageServices/CreatePrivateMessageService";
import ShowUserService from "../UserServices/ShowUserService";

export interface UpdateTicketData {
  status?: string;
  userId?: number | null;
  queueId?: number | null;
  chatbot?: boolean;
  queueOptionId?: number;
  justClose?: boolean;
}

interface Request {
  ticketData: UpdateTicketData;
  ticketId: number;
  reqUserId?: number;
  companyId?: number | undefined;
  dontRunChatbot?: boolean;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const sendFormattedMessage = async (
  message: string,
  ticket: Ticket,
  user?: User
) => {
  const messageText = formatBody(message, ticket, user);

  const wbot = await GetTicketWbot(ticket);
  const queueChangedMessage = await wbot.sendMessage(getJidOf(ticket), {
    text: messageText
  });
  await verifyMessage(queueChangedMessage, ticket, ticket.contact);
};

export function websocketUpdateTicket(ticket: Ticket, moreChannels?: string[]) {
  const io = getIO();
  let ioStack = io
    .to(ticket.id.toString())
    .to(`user-${ticket?.userId}`)
    .to(`queue-${ticket.queueId}-notification`)
    .to(`queue-${ticket.queueId}-${ticket.status}`)
    .to(`company-${ticket.companyId}-notification`)
    .to(`company-${ticket.companyId}-${ticket.status}`);

  if (moreChannels) {
    moreChannels.forEach(channel => {
      ioStack = ioStack.to(channel);
    });
  }

  ioStack.emit(`company-${ticket.companyId}-ticket`, {
    action: "update",
    ticket
  });
}

async function logPrivateChange({
  ticket,
  oldUserId,
  oldQueueId,
  oldStatus,
  companyId,
  actorUserId,
}: {
  ticket: Ticket;
  oldUserId?: number;
  oldQueueId?: number | null;
  oldStatus: string;
  companyId: number;
  actorUserId?: number;
}) {
  const changedAssignee = oldUserId !== ticket.userId;
  const changedQueue = oldQueueId !== ticket.queueId;
  const isClosedNow = oldStatus !== "closed" && ticket.status === "closed";
  const isReopenedNow = oldStatus === "closed" && ticket.status === "open";

  if (!(changedAssignee || changedQueue || isClosedNow || isReopenedNow)) return;

  const [oldUser, newUser] = await Promise.all([
    oldUserId ? ShowUserService(oldUserId) : null,
    ticket.userId ? ShowUserService(ticket.userId) : null
  ]);

  const [oldQueue, newQueue] = await Promise.all([
    oldQueueId ? Queue.findByPk(oldQueueId) : null,
    ticket.queueId ? Queue.findByPk(ticket.queueId) : null
  ]);

  const actionUser = actorUserId ? await ShowUserService(actorUserId) : null;
  const actorName = actionUser?.name || "Usuário desconhecido";

  const header = isClosedNow
    ? `*Chamado fechado por:* *${actorName}*`
    : isReopenedNow
      ? `*Chamado reaberto por:* *${actorName}*`
      : `*Chamado transferido por:* *${actorName}*`;

  const detalhes = [
    changedQueue
      ? `🏷️ *Fila:* ${oldQueue?.name || "Sem fila"} ➜ ${newQueue?.name || "Sem fila"}`
      : "",
    changedAssignee
      ? `👤 *Atendente:* ${oldUser?.name || "Sem atendente"} ➜ ${newUser?.name || "Sem atendente"}`
      : "",
    `🕒 *${moment().format("DD/MM/YYYY HH:mm:ss")}*`
  ].filter(Boolean).join("\n");

  const logMsg = `${header}\n${detalhes}`;

  await CreatePrivateMessageService({
    messageData: { ticketId: ticket.id, body: logMsg, fromMe: true },
    companyId
  });
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  reqUserId,
  companyId,
  dontRunChatbot
}: Request): Promise<Response> => {
  try {
    logger.debug(`UpdateTicketService: Starting for ticketId ${ticketId} with data ${JSON.stringify(ticketData)}`);

    if (!companyId && !reqUserId) {
      logger.error("UpdateTicketService: Missing reqUserId or companyId");
      throw new Error("Need reqUserId or companyId");
    }

    const user = reqUserId ? await User.findByPk(reqUserId) : null;

    if (reqUserId) {
      if (!user) {
        logger.error(`UpdateTicketService: User not found for reqUserId ${reqUserId}`);
        throw new AppError("User not found", 404);
      }
      companyId = user.companyId;
    }
    const { justClose } = ticketData;
    let { status } = ticketData;
    let { queueId, userId } = ticketData;
    const fromChatbot = ticketData.chatbot || false;
    let chatbot: boolean | null = fromChatbot;
    let queueOptionId: number | null = ticketData.queueOptionId || null;

    const io = getIO();

    const userRatingSetting = await GetCompanySetting(
      companyId,
      "userRating",
      "disabled"
    );

    const whmcsTicketIntegrationEnabled = await GetCompanySetting(
      companyId,
      "whmcsTicketIntegrationEnabled",
      "disabled"
    );

    logger.debug(`UpdateTicketService: Fetching ticket ${ticketId}`);
    const ticket = await ShowTicketService(ticketId, companyId);
    logger.debug(`UpdateTicketService: Ticket fetched: ${ticket.id}`);

    const isGroup = ticket.contact?.isGroup || ticket.isGroup;

    if (queueId && queueId !== ticket.queueId) {
      const newQueue = await Queue.findByPk(queueId);
      if (!newQueue) {
        logger.error(`UpdateTicketService: Queue not found for queueId ${queueId}`);
        throw new AppError("Queue not found", 404);
      }
      if (newQueue.companyId !== ticket.companyId) {
        logger.error(`UpdateTicketService: Queue ${queueId} does not belong to company ${ticket.companyId}`);
        throw new AppError("Queue does not belong to the same company", 403);
      }
    }

    if (user && ticket.status !== "pending") {
      if (user.profile !== "admin" && ticket.userId !== user.id) {
        logger.warn(`UpdateTicketService: User ${user.id} tried to update ticket ${ticket.id} without permission.`);
        throw new AppError("ERR_FORBIDDEN", 403);
      }
    }

    logger.debug(`UpdateTicketService: Finding or creating ticket tracking for ticket ${ticketId}`);
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId,
      companyId,
      whatsappId: ticket.whatsappId
    });
    logger.debug(`UpdateTicketService: Ticket tracking processed.`);

    if (ticket.channel === "whatsapp" && status === "open") {
      try {
        logger.debug(`UpdateTicketService: Setting messages as read for ticket ${ticketId}`);
        await SetTicketMessagesAsRead(ticket);
        logger.debug(`UpdateTicketService: Messages set as read for ticket ${ticketId}`);
      } catch (err) {
        logger.error(
          { ticketId, message: err?.message },
          "UpdateTicketService: Could not set messages as read."
        );
      }
    }

    const oldStatus = ticket.status;
    const oldUserId = ticket.user?.id;
    const oldQueueId = ticket.queueId;

    // only admin can accept pending tickets that have no queue
    if (!oldQueueId && userId && oldStatus === "pending" && status === "open") {
      const acceptUser = await User.findByPk(userId);
      if (acceptUser.profile !== "admin") {
        logger.warn(`UpdateTicketService: Non-admin user ${userId} tried to accept pending ticket ${ticketId} without queue.`);
        throw new AppError("ERR_NO_PERMISSION", 403);
      }
    }

    if (oldStatus === "closed") {
      logger.debug(`UpdateTicketService: Checking contact open tickets for contact ${ticket.contactId}`);
      await CheckContactOpenTickets(ticket.contactId, ticket.whatsappId);
      logger.debug(`UpdateTicketService: Contact open tickets checked.`);
      chatbot = null;
      queueOptionId = null;
    }

    if (status !== undefined && ["closed"].indexOf(status) > -1) {
      logger.debug(`UpdateTicketService: Closing ticket ${ticketId}. WHMCS integration check.`);
      // Início da Integração WHMCS para Fechamento
      if (whmcsTicketIntegrationEnabled === "enabled" && ticket.whmcsTicketId && ticket.contact.whmcsClientId) {
        try {
          logger.debug(`UpdateTicketService: Fetching messages for WHMCS integration for ticket ${ticketId}`);
          const messages = await Message.findAll({
            where: { ticketId: ticket.id },
            order: [["createdAt", "ASC"]],
            include: [{ model: Contact, as: "contact" }]
          });
          logger.debug(`UpdateTicketService: Messages fetched for WHMCS integration.`);

          const conversationLog = messages
            .map(msg => {
              const sender = msg.fromMe ? "Atendente" : msg.contact.name;
              const timestamp = moment(msg.createdAt).format("DD/MM/YYYY HH:mm:ss");
              return `[${timestamp}] ${sender}:\n${msg.body}`;
            })
            .join("\n\n---------------------------------\n\n");

          logger.debug(`UpdateTicketService: Sending AddTicketReply to WHMCS for ticket ${ticket.whmcsTicketId}`);
          await WhmcsService.execute({
            action: "AddTicketReply",
            ticketid: ticket.whmcsTicketId,
            clientid: ticket.contact.whmcsClientId,
            message: `Conversa do RC-CHAT:\n\n${conversationLog}`
          });
          logger.debug(`UpdateTicketService: AddTicketReply sent to WHMCS.`);

          logger.debug(`UpdateTicketService: Sending UpdateTicket to WHMCS for ticket ${ticket.whmcsTicketId}`);
          await WhmcsService.execute({
            action: "UpdateTicket",
            ticketid: ticket.whmcsTicketId,
            status: "Closed"
          });
          logger.debug(`UpdateTicketService: UpdateTicket sent to WHMCS.`);

          logger.info(`Ticket do WHMCS ${ticket.whmcsTicketId} fechado e atualizado com a conversa.`);
        } catch (error: any) { // Explicitly type error as 'any'
          logger.error({ err: error, ticketId }, "UpdateTicketService: Falha ao fechar ticket no WHMCS.");
          // Não lança erro para não impedir o fechamento no RC-CHAT
          logger.error(`UpdateTicketService: WHMCS Integration Error for ticket ${ticketId}: ${error.message}`);
        }
      } else {
        logger.warn(`UpdateTicketService: WHMCS Integration is disabled or Ticket ID/Client ID not found for ticket ${ticket.id}. Closing in WHMCS skipped.`);
      }
      // Fim da Integração WHMCS

      if (!ticketTraking.finishedAt) {
        ticketTraking.finishedAt = moment().toDate();
        ticketTraking.whatsappId = ticket.whatsappId;
        ticketTraking.userId = ticket.userId;
      }

      if (
        userRatingSetting === "enabled" &&
        ticket.whatsapp?.status === "CONNECTED" &&
        ticket.userId &&
        !isGroup &&
        !ticket.contact.disableBot
      ) {
        if (!ticketTraking.ratingAt && !justClose) {
          if (ticket.channel === "whatsapp") {
            const ratingTxt =
              ticket.whatsapp.ratingMessage?.trim() ||
              _t("Please rate our service", ticket);
            const rateInstructions = _t("Send a rating from 1 to 5", ticket);
            const rateReturn = _t(
              "Send *`!`* to return to the service",
              ticket
            );
            const bodyRatingMessage = `${ratingTxt}\n\n*${rateInstructions}*\n\n${rateReturn}`;

            logger.debug(`UpdateTicketService: Sending rating message for ticket ${ticketId}`);
            await SendWhatsAppMessage({ body: bodyRatingMessage, ticket });
            logger.debug(`UpdateTicketService: Rating message sent.`);
          }

          ticketTraking.ratingAt = moment().toDate();
          await ticketTraking.save();

          await ticket.update({
            chatbot: null,
            queueOptionId: null,
            status: "closed"
          });

          await ticket.reload();

          io.to(`company-${ticket.companyId}-open`)
            .to(`queue-${ticket.queueId}-open`)
            .to(ticketId.toString())
            .emit(`company-${ticket.companyId}-ticket`, {
              action: "delete",
              ticketId: ticket.id
            });

          io.to(`company-${ticket.companyId}-closed`)
            .to(`queue-${ticket.queueId}-closed`)
            .to(ticket.id.toString())
            .emit(`company-${ticket.companyId}-ticket`, {
              action: "update",
              ticket,
              ticketId: ticket.id
            });

          return { ticket, oldStatus, oldUserId };
        }
      }

      if (
        !isGroup &&
        !ticket.contact.disableBot &&
        !justClose &&
        ticket.whatsapp?.complationMessage.trim() &&
        ticket.whatsapp.status === "CONNECTED"
      ) {
        const body = formatBody(
          `${ticket.whatsapp.complationMessage.trim()}`,
          ticket
        );

        if (ticket.channel === "whatsapp" && !isGroup) {
          logger.debug(`UpdateTicketService: Sending completion message for ticket ${ticketId}`);
          const sentMessage = await SendWhatsAppMessage({ body, ticket });
          logger.debug(`UpdateTicketService: Completion message sent.`);
          await verifyMessage(sentMessage, ticket, ticket.contact);
        }
      }

      const keepUserAndQueue = await GetCompanySetting(
        companyId,
        "keepUserAndQueue",
        "enabled"
      );

      if (keepUserAndQueue === "disabled") {
        queueId = null;
        userId = null;
      }
    }

    if (queueId !== undefined && queueId !== null && !ticketTraking.startedAt) {
      ticketTraking.queuedAt = moment().toDate();
    }

    if (ticket.chatbot && !chatbot) {
      ticketTraking.chatbotendAt = moment().toDate();
    }

    logger.debug(`UpdateTicketService: Updating ticket ${ticketId} in DB.`);
    await ticket.update({
      status,
      queueId,
      userId,
      whatsappId: ticket.whatsappId,
      chatbot,
      queueOptionId
    });
    logger.debug(`UpdateTicketService: Ticket ${ticketId} updated in DB.`);

    logger.debug(`UpdateTicketService: Logging private change for ticket ${ticketId}`);
    await logPrivateChange({
      ticket,
      oldUserId,
      oldQueueId,
      oldStatus,
      companyId,
      actorUserId: reqUserId
    });
    logger.debug(`UpdateTicketService: Private change logged.`);

    if (oldStatus !== status) {
      if (oldStatus === "closed" && status === "open") {
        logger.debug(`UpdateTicketService: Incrementing ticket-reopen counter for company ${companyId}`);
        await incrementCounter(companyId, "ticket-reopen");
      } else if (status === "open") {
        logger.debug(`UpdateTicketService: Incrementing ticket-accept counter for company ${companyId}`);
        await incrementCounter(companyId, "ticket-accept");
      } else if (status === "closed") {
        logger.debug(`UpdateTicketService: Incrementing ticket-close counter for company ${companyId}`);
        await incrementCounter(companyId, "ticket-close");
      } else if (status === "pending" && oldQueueId !== queueId) {
        logger.debug(`UpdateTicketService: Incrementing ticket-transfer counter for company ${companyId}`);
        await incrementCounter(companyId, "ticket-transfer");
      }
    }

    logger.debug(`UpdateTicketService: Reloading ticket ${ticketId}`);
    await ticket.reload();
    logger.debug(`UpdateTicketService: Ticket ${ticketId} reloaded.`);

    status = ticket.status;

    if (status !== undefined && ["pending"].indexOf(status) > -1) {
      if (!ticketTraking.startedAt) {
        ticketTraking.whatsappId = ticket.whatsappId;
        ticketTraking.queuedAt = moment().toDate();
        ticketTraking.startedAt = null;
        ticketTraking.userId = null;
      }
      io.to(`company-${companyId}-mainchannel`).emit(
        `company-${companyId}-ticket`,
        {
          action: "removeFromList",
          ticketId: ticket?.id
        }
      );
    }

    if (status !== undefined && ["open"].indexOf(status) > -1) {
      if (!ticketTraking.startedAt) {
        ticketTraking.startedAt = moment().toDate();
        ticketTraking.ratingAt = null;
        ticketTraking.rated = false;
        ticketTraking.whatsappId = ticket.whatsappId;
        ticketTraking.userId = ticket.userId;
      }
      io.to(`company-${companyId}-mainchannel`).emit(
        `company-${companyId}-ticket`,
        {
          action: "removeFromList",
          ticketId: ticket?.id
        }
      );

      io.to(`company-${companyId}-mainchannel`).emit(
        `company-${companyId}-ticket`,
        {
          action: "updateUnread",
          ticketId: ticket?.id
        }
      );
    }

    logger.debug(`UpdateTicketService: Saving ticket tracking for ticket ${ticketId}`);
    ticketTraking.save();
    logger.debug(`UpdateTicketService: Ticket tracking saved.`);

    if (
      !dontRunChatbot &&
      !ticket.userId &&
      ticket.queueId &&
      ticket.queueId !== oldQueueId
    ) {
      logger.debug(`UpdateTicketService: Starting chatbot for ticket ${ticketId}`);
      const wbot = await GetTicketWbot(ticket);
      if (wbot) {
        await startQueue(wbot, ticket);
        await ticket.reload();
      }
      logger.debug(`UpdateTicketService: Chatbot started for ticket ${ticketId}`);
    }

    if (
      !isGroup &&
      !ticket.chatbot &&
      !ticket.contact.disableBot &&
      !fromChatbot &&
      !dontRunChatbot
    ) {
      let accepted = false;
      if (
        ticket.userId &&
        ticket.status === "open" &&
        ticket.userId !== oldUserId
      ) {
        const acceptedMessage = await GetCompanySetting(
          companyId,
          "ticketAcceptedMessage",
          ""
        );

        if (acceptedMessage && ticket.whatsapp?.status === "CONNECTED") {
          const acceptUser = await User.findByPk(userId);
          logger.debug(`UpdateTicketService: Sending accepted message for ticket ${ticketId}`);
          await sendFormattedMessage(acceptedMessage, ticket, acceptUser);
          logger.debug(`UpdateTicketService: Accepted message sent.`);
          accepted = true;
        }
      }

      if (
        !accepted &&
        oldQueueId &&
        ticket.queueId &&
        oldQueueId !== ticket.queueId &&
        ticket.whatsapp?.status === "CONNECTED"
      ) {
        const systemTransferMessage = await GetCompanySetting(
          companyId,
          "transferMessage",
          ""
        );
        const transferMessage =
          ticket.whatsapp.transferMessage || systemTransferMessage;

        if (transferMessage) {
          logger.debug(`UpdateTicketService: Sending transfer message for ticket ${ticketId}`);
          await sendFormattedMessage(transferMessage, ticket);
          logger.debug(`UpdateTicketService: Transfer message sent.`);
        }
      }
    }

    if (justClose && status === "closed") {
      io.to(`company-${companyId}-mainchannel`).emit(
        `company-${companyId}-ticket`,
        {
          action: "removeFromList",
          ticketId: ticket?.id
        }
      );
    } else if (ticket.status === "closed" && ticket.status !== oldStatus) {
      io.to(`company-${companyId}-${oldStatus}`)
        .to(`queue-${ticket.queueId}-${oldStatus}`)
        .to(`user-${oldUserId}`)
        .emit(`company-${companyId}-ticket`, {
          action: "removeFromList",
          ticketId: ticket.id
        });
    }

    logger.debug(`UpdateTicketService: Emitting websocket update for ticket ${ticketId}`);
    websocketUpdateTicket(ticket, [`user-${oldUserId}`]);
    logger.debug(`UpdateTicketService: Websocket update emitted.`);

    return { ticket, oldStatus, oldUserId };
  } catch (err: any) { // Explicitly type err as 'any'
    logger.error(
      { error: err?.name, message: err?.message, stack: err?.stack, ticketId },
      "UpdateTicketService: Unhandled error"
    );
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Error updating ticket: ${err.message || "Unknown error"}`, 500);
  }
};

export default UpdateTicketService;
