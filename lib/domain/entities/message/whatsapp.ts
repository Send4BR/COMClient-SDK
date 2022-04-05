import { Message, MessageData } from './message'

// type MessageType = {
//   from: string,
// };

type RecipientType = {
    phone: string
}

type WhatsappData = {
  message: unknown
  recipient: RecipientType
} & MessageData

export class Whatsapp implements Message {
  readonly channel: string = 'whatsapp'
  readonly externalId?: string
  readonly message: unknown
  readonly scheduledTo?: string
  readonly recipient: RecipientType

  constructor({ message, recipient, externalId, scheduledTo }: Pick<WhatsappData, 'message' | 'recipient' | 'externalId' | 'scheduledTo'>) {
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
