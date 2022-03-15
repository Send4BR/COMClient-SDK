import { Message, MessageData } from './message'

// type MessageType = {
//   from: string,
// };

type RecipientType = {
    phone: string
}

type WhatsappData = {
  message: any
  recipient: RecipientType
} & MessageData

export class Whatsapp implements Message {
  readonly channel: string = 'whatsapp'
  readonly externalId?: string 
  readonly message: any
  readonly recipient: RecipientType

  constructor({ message, recipient, externalId }: Pick<WhatsappData, 'message' | 'recipient' | 'externalId'>) {
    this.externalId = externalId
    this.message = message
    this.recipient = recipient
  }

  getMessage(): WhatsappData {
    return {
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message,
    }
  }
}
