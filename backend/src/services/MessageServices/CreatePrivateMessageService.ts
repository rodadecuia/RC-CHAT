import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
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
  try {
    const messageToCreate = {
      ...messageData,
      companyId,
      isPrivate: true,
    };

    const createdMessage = await Message.create(messageToCreate);

    if (!createdMessage) {
      throw new Error("Failed to create message: Message.create returned null/undefined.");
    }

    const ticket = await Ticket.findByPk(messageData.ticketId);

    if (ticket) {
      await ticket.update({
        lastMessage: messageData.body,
      });
    }

    return createdMessage;

  } catch (error: any) {
    logger.error(
      { err: error, ticketId: messageData.ticketId },
      `CreatePrivateMessageService: Caught error during message creation: ${error.message}. Stack: ${error.stack}`
    );
    throw error;
  }
};

export default CreatePrivateMessageService;
