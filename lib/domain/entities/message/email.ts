import { Message, MessageData } from './message'

type MessageType = {
  from: string,
  subject: string,
  body: string,
  cc: string
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
  readonly externalId?: string
  readonly message: MessageType
  readonly recipient: RecipientType
  readonly scheduledTo?: string

  constructor({ message, recipient, externalId, scheduledTo }: Pick<EmailData, 'message' | 'recipient' | 'externalId' | 'scheduledTo'>) {
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
