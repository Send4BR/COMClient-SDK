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

export class Whatsapp implements Message {
  readonly channel: string = 'whatsapp'
  readonly externalId?: string
  readonly message: MessageType
  readonly scheduledTo?: string
  readonly recipient: RecipientType

  constructor({
    message,
    recipient,
    externalId,
    scheduledTo
  }: Pick<WhatsappData, 'message' | 'recipient' | 'externalId' | 'scheduledTo'>) {
    this.externalId = externalId
    this.message = message
    this.recipient = recipient
    this.scheduledTo = scheduledTo?.toISOString()
  }

  getMessage() {
    return {
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message,
      scheduledTo: this.scheduledTo
    }
  }
}
