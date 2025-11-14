import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

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
  await Message.create({
    ...messageData,
    companyId,
    isPrivate: true,
  });

  const ticket = await Ticket.findByPk(messageData.ticketId);

  if (ticket) {
    await ticket.update({
      lastMessage: messageData.body,
    });
  }

  return;
};

export default CreatePrivateMessageService;
