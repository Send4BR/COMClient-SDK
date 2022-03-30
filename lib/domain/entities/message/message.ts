export type MessageData = {
  externalId?: string;
  channel: string;
  scheduledTo?: Date
}

export interface Message {
   externalId?: string
   channel?: string
   scheduledTo?: string
   getMessage(): Partial<Omit<MessageData, 'scheduledTo'>> & {scheduledTo?: string}
}
