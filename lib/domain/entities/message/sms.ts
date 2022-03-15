import { Message, MessageData } from './message';
import { normalizeDiacritics } from 'normalize-text';

type MessageType = {
  prefix?: string;
  text: string;
  suffix?: string;
  variables?: Record<string, string>;
};

type RecipientType = {
  phone: string;
};

type SMSData = {
  message: MessageType;
  recipient: RecipientType;
} & MessageData;

export class SMS extends Message {
  private readonly message: MessageType;
  readonly channel: string = 'sms';
  readonly recipient: RecipientType;

  constructor({ message, recipient, externalId }: SMSData) {
    super({ externalId });
    this.message = this.normalize(message);
    this.recipient = recipient;
    this.replaceVariables();
  }

  get text() {
    return this.message.text;
  }

  private set text(text: string) {
    this.message.text = text;
  }

  get suffix() {
    return this.message.suffix;
  }

  private set suffix(suffix: string | undefined) {
    this.message.suffix = suffix;
  }

  get prefix() {
    return this.message.prefix;
  }

  private set prefix(prefix: string | undefined) {
    this.message.prefix = prefix;
  }

  private get variables() {
    return this.message.variables;
  }

  shortify(char = 160) {
    const SEE_MORE = '... Veja mais em:';
    const LINK = '$link';
    if (this.messageSize > char) {
      this.text = this.text.replace(LINK, '');
      this.text = this.text = this.text.slice(
        0,
        char -
          ((this.variables?.link.length ?? 0) +
            (this.prefix?.length ?? 0) +
            (this.suffix?.length ?? 0) +
            SEE_MORE.length +
            LINK.length)
      );
      this.suffix = this.variables?.link ? `${SEE_MORE} ${this.variables?.link}${ this.suffix ? ` ${this.suffix}` : ''}` : undefined;
    } else {
      this.text = this.text.replace(LINK, this.variables?.link ?? '');
    }

    this.build();
  }

  
  
  private build() {
    if (!this.prefix && !this.suffix) return
    if (this.prefix && this.suffix) this.text = `${this.prefix}: ${this.text} ${this.suffix}`;
    if (!this.prefix) this.text = `${this.text} ${this.suffix}`;
    if (!this.suffix) this.text = `${this.prefix} ${this.text}`
  } 

  private get messageSize() {
    const SMS_LINK_MAX_SIZE = 30;
    return (
      (this.message.prefix?.length ?? 0) +
      (this.message.suffix?.length ?? 0) +
      this.message.text.length +
      SMS_LINK_MAX_SIZE
    );
  }

  private replaceVariables() {
    Object.keys(this.variables ?? {}).map((key) => {
      if (key !== 'link') {
        const value = this.variables ? this.variables[key] : '';
        this.text = this.text.replace('$' + key, value);
      }
    });
  }

  private normalize(message: MessageType): MessageType {
    return {
      text: normalizeDiacritics(message.text),
      suffix: message.suffix ? normalizeDiacritics(message.suffix) : undefined,
      prefix: message.prefix ? normalizeDiacritics(message.prefix) : undefined,
      variables: message.variables
    };
  }
}
