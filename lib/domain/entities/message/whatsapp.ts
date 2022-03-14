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

export class Whatsapp extends Message {
  readonly channel: string = 'whatsapp'
  readonly message: any
  readonly recipient: RecipientType

  constructor({ message, recipient, externalId }: WhatsappData) {
    super({ externalId })
    this.message = message
    this.recipient = recipient
  }
}
