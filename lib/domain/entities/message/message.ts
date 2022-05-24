export type MessageData = {
  externalId?: string;
  channel: string;
  scheduledTo?: Date
  replyingTo?: string
}

export interface Message {
   externalId?: string
   replyingTo?: string
   channel?: string
   scheduledTo?: string

   getMessage(): Partial<Omit<MessageData, 'scheduledTo'>> & {scheduledTo?: string}
}
