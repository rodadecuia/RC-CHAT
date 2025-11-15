import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../../utils/logger";

interface MessageData {
  id?: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  ack?: number;
  isPrivate?: boolean;
}
interface Request {
  messageData: MessageData;
  companyId: number;
}

const CreatePrivateMessageService = async ({
  messageData,
  companyId,
}: Request): Promise<Message> => {
  let messageId: string;
  if (messageData.id && messageData.id.trim() !== "") {
    messageId = messageData.id;
  } else {
    const generatedUuid = uuidv4();
    logger.debug(`CreatePrivateMessageService: Generated UUID: ${generatedUuid}`);
    messageId = generatedUuid;
  }
  logger.debug(`CreatePrivateMessageService: Final messageId: ${messageId} for ticketId: ${messageData.ticketId}`);

  try {
    const messageToCreate = {
      ...messageData,
      id: messageId,
      companyId,
      isPrivate: true,
    };

    logger.debug(`CreatePrivateMessageService: Data passed to Message.create: ${JSON.stringify(messageToCreate)}`);

    const createdMessage = await Message.create(messageToCreate);

    logger.debug(`CreatePrivateMessageService: Result of Message.create: type=${typeof createdMessage}, value=${createdMessage}`);

    if (!createdMessage) {
      logger.error(`CreatePrivateMessageService: Message.create returned null or undefined for messageId: ${messageId}. Throwing a specific error.`);
      throw new Error(`Failed to create message: Message.create returned null/undefined for ID ${messageId}.`);
    }

    logger.debug(`CreatePrivateMessageService: Message successfully created with ID: ${createdMessage.id}`);

    const ticket = await Ticket.findByPk(messageData.ticketId);

    if (ticket) {
      await ticket.update({
        lastMessage: messageData.body,
      });
    }

    return createdMessage;

  } catch (error: any) {
    logger.error(`CreatePrivateMessageService: Caught error during message creation for ticketId ${messageData.ticketId}: ${error.message}`, { error });
    throw error;
  }
};

export default CreatePrivateMessageService;
