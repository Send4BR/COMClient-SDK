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

export class Email implements Message {
  readonly channel: string = 'email'
  readonly externalId?: string;
  readonly message: MessageType
  readonly recipient: RecipientType

  constructor({ message, recipient, externalId }: Pick<EmailData, 'message' | 'recipient' | 'externalId'>) {
    this.externalId = externalId
    this.message = message
    this.recipient = recipient
  }

  getMessage(): EmailData {
    return {
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message,
    }
  }
}