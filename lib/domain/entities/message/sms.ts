import { normalizeDiacritics } from 'normalize-text'
import { LinkNotProvidedError } from '../../errors/link-not-provided'
import { SMSShortify } from '../../service/smsshortify'
import { Message, MessageData } from './message'

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

export class SMS extends Message {
  readonly channel: string = 'sms'
  readonly externalId?: string
  readonly scheduledTo?: string
  private readonly recipient: RecipientType
  private readonly message: MessageType
  private readonly shortifyService: SMSShortify
  readonly replyingTo?: string

  constructor({ message, recipient, externalId, scheduledTo, replyingTo }: Pick<SMSData, 'message' | 'recipient' | 'externalId' | 'scheduledTo' | 'replyingTo'>) {
    super()
    this.externalId = externalId
    this.message = this.normalize(message)
    this.recipient = recipient
    this.scheduledTo = scheduledTo?.toISOString()
    this.replyingTo = replyingTo
    this.replaceVariables()
    this.shortifyService = new SMSShortify({
      text: this.text,
      prefix: this.prefix,
      suffix: this.suffix,
      link: this.variables?.link
    })
    this.verify()
  }

  public getMessage() {
    this.format()

    return {
      id: this.id,
      externalId: this.externalId,
      message: {
        text: this.text
      },
      channel: this.channel,
      recipient: this.recipient,
      scheduledTo: this.scheduledTo,
      replyingTo: this.replyingTo
    }
  }

  public shortify(char = 160) {
    const { text, prefix, suffix } = this.shortifyService.execute(char)
    this.text = text
    this.prefix = prefix
    this.suffix = suffix
  }

  private format() {
    this.text = (`${this.prefix ?? ''} ${this.text} ${this.suffix ?? ''}`).trim()
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

  private verify() {
    if (this.message.text.includes('$link') && !this.message.variables?.link) throw new LinkNotProvidedError()
  }
}
