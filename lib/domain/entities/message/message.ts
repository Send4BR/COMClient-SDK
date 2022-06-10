import crypto from 'crypto'

export type MessageData = {
  externalId?: string;
  channel: string;
  scheduledTo?: Date
  replyingTo?: string
}

export abstract class Message {
  externalId?: string
  replyingTo?: string
  channel?: string
  scheduledTo?: string
  id: string

  constructor() {
    this.id = crypto.randomUUID()
  }

  abstract getMessage(): Partial<Omit<MessageData, 'scheduledTo'>> & {scheduledTo?: string}
}
