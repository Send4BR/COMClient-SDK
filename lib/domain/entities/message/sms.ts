import { Message, MessageData } from './message'

type MessageType = {
  prefix?: string
  text: string
  suffix?: string
  variables?: Record<string, string>
};

type RecipientType = {
    phone: string
}

type SMSData = {
  message: MessageType
  recipient: RecipientType
} & MessageData

export class SMS extends Message {
  readonly channel: string = 'sms'
  readonly message: MessageType
  readonly recipient: RecipientType

  constructor({ message, recipient, externalId }: SMSData) {
    super({ externalId })
    this.message = message
    this.recipient = recipient
  }


  shortify(char = 160){
    //TO-DO
  }
}
