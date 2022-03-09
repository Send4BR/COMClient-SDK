import { Message, MessageData } from './message'

type MessageType = {
  from: string,
  subject: string,
  body: string
};

type RecipientType = {
    email: string
}

type EmailData = {
  message: MessageType
  recipient: RecipientType
} & MessageData

export class Email extends Message {
  readonly channel: string = 'email'
  readonly message: MessageType
  readonly recipient: RecipientType

  constructor({ message, recipient, externalId }: EmailData) {
    super({ externalId })
    this.message = message
    this.recipient = recipient
  }
}
