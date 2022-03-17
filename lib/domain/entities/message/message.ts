export type MessageData = {
  externalId?: string;
  channel: string;
}

export interface Message {
   externalId?: string
   channel?: string
   getMessage(): Partial<MessageData>
}
