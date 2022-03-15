import { Message, MessageData } from './message'
import { normalizeDiacritics } from 'normalize-text'

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

type SMSOptions = {
  shortify?: boolean;
  char?: number;
};

export class SMS implements Message {
  readonly channel: string = 'sms'
  readonly externalId?: string
  readonly recipient: RecipientType
  private readonly message: MessageType
  private readonly RESERVED_SPACE_FORMAT = 3
  private readonly SEE_MORE = '... Veja mais em:'

  constructor(
    { message, recipient, externalId }: Pick<SMSData, 'message' | 'recipient' | 'externalId'>,
    options?: SMSOptions
  ) {
    this.externalId = externalId
    this.message = this.normalize(message)
    this.recipient = recipient
    this.replaceVariables()

    if (options?.shortify) {
      this.shortify(options.char)
    }

    this.build()
  }

  getMessage(): SMSData {
    return {
      externalId: this.externalId,
      message: { text: this.text },
      channel: this.channel,
      recipient: this.recipient
    }
  }

  get text() {
    return this.message.text
  }

  private set text(text: string) {
    this.message.text = text
  }

  get suffix() {
    return this.message.suffix
  }

  private set suffix(suffix: string | undefined) {
    this.message.suffix = suffix
  }

  get prefix() {
    return this.message.prefix
  }

  private set prefix(prefix: string | undefined) {
    this.message.prefix = prefix
  }

  private get variables() {
    return this.message.variables
  }

  private shortify(char = 160) {
    const LINK = '$link'
    if (this.messageSize > char) {
      this.createSuffix()
      this.text = this.text.replace(LINK, '')
      this.text = this.text = this.text.slice(
        0,
        char - ((this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.RESERVED_SPACE_FORMAT)
      )
    } else if (this.variables?.link) {
      this.text = this.text.replace(LINK, this.variables.link)
    }
  }

  private createSuffix() {
    this.suffix = this.variables?.link
      ? `${this.SEE_MORE} ${this.variables?.link}${this.suffix ? ` ${this.suffix}` : ''}`
      : undefined
  }

  private build() {
    if (!this.prefix && !this.suffix) return
    if (this.prefix && this.suffix) this.text = `${this.prefix}: ${this.text} ${this.suffix}`
    if (!this.prefix) this.text = `${this.text} ${this.suffix}`
    if (!this.suffix) this.text = `${this.prefix}: ${this.text}`

    this.prefix = undefined
    this.suffix = undefined
  }

  private get messageSize() {
    const SMS_LINK_MAX_SIZE = 30
    return (
      (this.message.prefix?.length ?? 0) +
      (this.message.suffix?.length ?? 0) +
      this.message.text.length +
      SMS_LINK_MAX_SIZE
    )
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
