import { Message, MessageData } from './message'

type Text = { type: 'text'; text: string };

type Template = { type: 'template'; template: string; fields: Record<string, string> };

type MessageType = Template | Text;

type RecipientType = {
  phone: string;
};

export type WhatsappData = {
  message: MessageType;
  recipient: RecipientType;
} & MessageData;

export class Whatsapp extends Message {
  readonly channel: string = 'whatsapp'
  readonly externalId?: string
  readonly message: MessageType
  readonly scheduledTo?: string
  readonly recipient: RecipientType
  readonly replyingTo?: string

  constructor({
    message,
    recipient,
    externalId,
    scheduledTo,
    replyingTo
  }: Pick<WhatsappData, 'message' | 'recipient' | 'externalId' | 'scheduledTo' | 'replyingTo'>) {
    super()
    this.externalId = externalId
    this.message = message
    this.recipient = recipient
    this.scheduledTo = scheduledTo?.toISOString()
    this.replyingTo = replyingTo
  }

  getMessage() {
    return {
      id: this.id,
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message,
      scheduledTo: this.scheduledTo,
      replyingTo: this.replyingTo
    }
  }
}
