type SMSShortifyType = {
  prefix?: string;
  text: string;
  suffix?: string;
  variables?: string;
  link?: string;
};

export class SMSShortify {
  private readonly RESERVED_SPACE_FORMAT = 3
  private readonly SEE_MORE = '... Veja mais em:'
  private readonly SMS_LINK_MAX_SIZE = 30
  private readonly LINK_VARIABLE = '$link'
  private text: string
  private prefix?: string
  private suffix?: string
  private link?: string

  constructor({ text, prefix, suffix, link }: SMSShortifyType) {
    this.text = text
    this.prefix = prefix
    this.suffix = suffix
    this.link = link
  }

  public execute(char = 160) {
    if (this.messageSize > char) {
      this.createSuffix()
      this.text = this.text.replace(this.LINK_VARIABLE, '')
      this.text = this.text.slice(
        0,
        char - ((this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.RESERVED_SPACE_FORMAT)
      )

      return { text: this.text, prefix: this.prefix, suffix: this.suffix }
    }
    this.text = this.link ? this.text.replace(this.LINK_VARIABLE, this.link) : this.text

    return { text: this.text, prefix: this.prefix, suffix: this.suffix }
  }

  private createSuffix() {
    this.suffix = this.link ? `${this.SEE_MORE} ${this.link}${this.suffix ? ` ${this.suffix}` : ''}` : undefined
  }

  private get messageSize() {
    return (this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.text.length + this.SMS_LINK_MAX_SIZE
  }
}
