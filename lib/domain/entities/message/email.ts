import { Message, MessageData } from './message'

type HTML = { body: string; subject: string }

type Template = { template: string; fields: Record<string, string> }

type MessageType = (HTML | Template) & {
  from: string
  cc?: string[]
  unsubscriptionId?: number
}

type RecipientType = {
  email: string
}

type EmailData = {
  message: MessageType
  recipient: RecipientType
} & MessageData

export class Email extends Message {
  readonly channel: string = 'email'
  readonly externalId?: string
  readonly message: MessageType
  readonly recipient: RecipientType
  readonly scheduledTo?: string
  readonly replyingTo?: string

  constructor({
    message,
    recipient,
    externalId,
    scheduledTo,
    replyingTo
  }: Pick<EmailData, 'message' | 'recipient' | 'externalId' | 'scheduledTo' | 'replyingTo'>) {
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
