export type MessageData = {
  externalId?: string;
}

export class Message {
  readonly externalId?: string

  constructor({ externalId }: MessageData) {
    this.externalId = externalId
  }
}
