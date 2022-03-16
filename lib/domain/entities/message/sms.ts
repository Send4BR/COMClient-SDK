import { Message, MessageData } from './message'
import { normalizeDiacritics } from 'normalize-text'
import { SMSShortify } from '../../service/smsshortify'

type MessageType = {
  prefix?: string;
  text: string;
  suffix?: string;
  variables?: Record<string, string>;
};

type RecipientType = {
  phone: string;
};

export type SMSData = {
  message: MessageType;
  recipient: RecipientType;
} & MessageData;

export class SMS implements Message {
  readonly channel: string = 'sms'
  readonly externalId?: string
  private readonly recipient: RecipientType
  private readonly message: MessageType
  private readonly shortifyService: SMSShortify

  constructor({ message, recipient, externalId }: Pick<SMSData, 'message' | 'recipient' | 'externalId'>) {
    this.externalId = externalId
    this.message = this.normalize(message)
    this.recipient = recipient
    this.replaceVariables()
    this.shortifyService = new SMSShortify({
      text: this.text,
      prefix: this.prefix,
      suffix: this.suffix,
      link: this.variables?.link
    })
  }

  public getMessage(): SMSData {
    this.format()

    return {
      externalId: this.externalId,
      message: {
        text: this.text
      },
      channel: this.channel,
      recipient: this.recipient
    }
  }

  public shortify(char = 160) {
    const { text, prefix, suffix } = this.shortifyService.execute(char)
    this.text = text
    this.prefix = prefix
    this.suffix = suffix
  }

  private format() {
    if (!this.prefix && !this.suffix) return
    if (this.prefix && this.suffix) this.text = `${this.prefix} ${this.text} ${this.suffix}`
    if (!this.prefix) this.text = `${this.text} ${this.suffix}`
    if (!this.suffix) this.text = `${this.prefix} ${this.text}`
  }

  private get text() {
    return this.message.text
  }

  private set text(text: string) {
    this.message.text = text
  }

  private get suffix() {
    return this.message.suffix
  }

  private set suffix(suffix: string | undefined) {
    this.message.suffix = suffix
  }

  private get prefix() {
    return this.message.prefix
  }

  private set prefix(prefix: string | undefined) {
    this.message.prefix = prefix
  }

  private get variables() {
    return this.message.variables
  }

  private replaceVariables() {
    const variables = this.variables ?? {}
    Object.keys(variables).forEach((key) => {
      if (key !== 'link') {
        this.text = this.text.replace('$' + key, variables[key])
      }
    })
  }

  private normalize(message: MessageType): MessageType {
    return {
      text: normalizeDiacritics(message.text),
      suffix: message.suffix ? normalizeDiacritics(message.suffix) : undefined,
      prefix: message.prefix ? normalizeDiacritics(message.prefix) : undefined,
      variables: message.variables
    }
  }
}
