type SMSShortifyType = {
  prefix?: string;
  text: string;
  suffix?: string;
  link?: string;
};

export class SMSShortify {
  private readonly RESERVED_SPACE_FORMAT = 2
  private readonly SEE_MORE = '... Veja mais em:'
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
      this.text = this.text.slice(0, this.calculateSlice(char))

      return { text: this.text, prefix: this.prefix, suffix: this.suffix }
    }

    this.text = this.replacedText
    return { text: this.text, prefix: this.prefix, suffix: this.suffix }
  }

  private calculateSlice(char: number) {
    return char - ((this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.RESERVED_SPACE_FORMAT)
  }

  private createSuffix() {
    if (!this.link) return
    const complement = `${this.SEE_MORE} ${this.link}`

    if (!this.suffix) {
      this.suffix = complement
      return
    }

    this.suffix = `${complement} ${this.suffix}`
  }

  private get replacedText() {
    if (!this.link) return this.text
    return this.text.replace(this.LINK_VARIABLE, this.link)
  }

  private get messageSize() {
    return (this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + (this.replacedText.length)
  }
}
