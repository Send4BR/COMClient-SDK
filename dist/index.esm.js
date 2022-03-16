// lib/infra/senders/sender-factory.ts
import { ServiceBusClient } from "@azure/service-bus";

// lib/errors/provider-not-implemented.ts
var ProviderNotImplemented = class extends Error {
  constructor(provider) {
    super(`Provider ${provider} is not implemented`);
  }
};

// lib/infra/senders/faker/message.ts
var _FakerMessageSender = class {
  async dispatch(message, topic) {
    console.log("sending message to topic " + topic);
    _FakerMessageSender.sender.push(message);
  }
  static get messages() {
    return this.sender;
  }
  static cleanMessages() {
    this.sender = [];
  }
};
var FakerMessageSender = _FakerMessageSender;
FakerMessageSender.canHandle = "faker";
FakerMessageSender.sender = [];

// lib/infra/senders/service-bus/message.ts
var MessageServiceBusSender = class {
  constructor(client) {
    this.client = client;
  }
  async dispatch(message, topic) {
    const sender = this.client.createSender(topic);
    try {
      await sender.sendMessages({
        body: message,
        contentType: "application/json"
      });
    } catch (err) {
      console.error(err);
    } finally {
      await sender.close();
      await this.client.close();
    }
  }
};
MessageServiceBusSender.canHandle = "servicebus";

// lib/infra/senders/sender-factory.ts
var _SenderFactory = class {
  static create(provider, connectionString) {
    const Sender = _SenderFactory.senders.find((sender) => sender.canHandle === provider);
    switch (Sender) {
      case MessageServiceBusSender:
        return new Sender(new ServiceBusClient(connectionString));
      case FakerMessageSender:
        return new Sender();
    }
    throw new ProviderNotImplemented(provider);
  }
};
var SenderFactory = _SenderFactory;
SenderFactory.senders = [MessageServiceBusSender, FakerMessageSender];

// lib/application/service/client.ts
var COMClient = class {
  constructor({ environment = "production", provider = "servicebus", connectionString, origin, clientId }) {
    this.provider = provider;
    this.origin = origin;
    this.clientId = clientId;
    this.connectionString = connectionString;
    this.MESSAGE_QUEUE = `${environment}--send-message`;
  }
  async dispatch(message) {
    const sender = SenderFactory.create(this.provider, this.connectionString);
    await sender.dispatch({ ...message.getMessage(), origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE);
  }
};

// lib/domain/entities/message/email.ts
var Email = class {
  constructor({ message, recipient, externalId }) {
    this.channel = "email";
    this.externalId = externalId;
    this.message = message;
    this.recipient = recipient;
  }
  getMessage() {
    return {
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message
    };
  }
};

// lib/domain/entities/message/sms.ts
import { normalizeDiacritics } from "normalize-text";

// lib/domain/service/smsshortify.ts
var SMSShortify = class {
  constructor({ text, prefix, suffix, link }) {
    this.RESERVED_SPACE_FORMAT = 3;
    this.SEE_MORE = "... Veja mais em:";
    this.LINK_VARIABLE = "$link";
    this.text = text;
    this.prefix = prefix;
    this.suffix = suffix;
    this.link = link;
  }
  execute(char = 160) {
    if (this.messageSize > char) {
      this.createSuffix();
      this.text = this.text.replace(this.LINK_VARIABLE, "");
      this.text = this.text.slice(0, this.calculateSlice(char));
      return { text: this.text, prefix: this.prefix, suffix: this.suffix };
    }
    this.text = this.link ? this.text.replace(this.LINK_VARIABLE, this.link) : this.text;
    return { text: this.text, prefix: this.prefix, suffix: this.suffix };
  }
  calculateSlice(char) {
    return char - ((this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.RESERVED_SPACE_FORMAT);
  }
  createSuffix() {
    this.suffix = this.link ? `${this.SEE_MORE} ${this.link}${this.suffix ? ` ${this.suffix}` : ""}` : void 0;
  }
  get messageSize() {
    return (this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.text.length + (this.link?.length ?? 0);
  }
};

// lib/domain/entities/message/sms.ts
var SMS = class {
  constructor({ message, recipient, externalId }) {
    this.channel = "sms";
    this.externalId = externalId;
    this.message = this.normalize(message);
    this.recipient = recipient;
    this.replaceVariables();
    this.shortifyService = new SMSShortify({
      text: this.text,
      prefix: this.prefix,
      suffix: this.suffix,
      link: this.variables?.link
    });
  }
  getMessage() {
    this.format();
    return {
      externalId: this.externalId,
      message: {
        text: this.text
      },
      channel: this.channel,
      recipient: this.recipient
    };
  }
  shortify(char = 160) {
    const { text, prefix, suffix } = this.shortifyService.execute(char);
    this.text = text;
    this.prefix = prefix;
    this.suffix = suffix;
  }
  format() {
    if (!this.prefix && !this.suffix)
      return;
    if (this.prefix && this.suffix)
      this.text = `${this.prefix} ${this.text} ${this.suffix}`;
    if (!this.prefix)
      this.text = `${this.text} ${this.suffix}`;
    if (!this.suffix)
      this.text = `${this.prefix} ${this.text}`;
  }
  get text() {
    return this.message.text;
  }
  set text(text) {
    this.message.text = text;
  }
  get suffix() {
    return this.message.suffix;
  }
  set suffix(suffix) {
    this.message.suffix = suffix;
  }
  get prefix() {
    return this.message.prefix;
  }
  set prefix(prefix) {
    this.message.prefix = prefix;
  }
  get variables() {
    return this.message.variables;
  }
  replaceVariables() {
    const variables = this.variables ?? {};
    Object.keys(variables).forEach((key) => {
      if (key !== "link") {
        this.text = this.text.replace("$" + key, variables[key]);
      }
    });
  }
  normalize(message) {
    return {
      text: normalizeDiacritics(message.text),
      suffix: message.suffix ? normalizeDiacritics(message.suffix) : void 0,
      prefix: message.prefix ? normalizeDiacritics(message.prefix) : void 0,
      variables: message.variables
    };
  }
};

// lib/domain/entities/message/whatsapp.ts
var Whatsapp = class {
  constructor({ message, recipient, externalId }) {
    this.channel = "whatsapp";
    this.externalId = externalId;
    this.message = message;
    this.recipient = recipient;
  }
  getMessage() {
    return {
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message
    };
  }
};

// lib/application/service/internal-client.ts
var COMInternal = class {
  constructor({ environment = "production", provider = "servicebus", connectionString }) {
    this.provider = provider;
    this.connectionString = connectionString;
    this.ERROR_QUEUE = `${environment}--message-fail`;
    this.SUCCESS_QUEUE = `${environment}--message-success`;
  }
  async error(data) {
    const sender = SenderFactory.create(this.provider, this.connectionString);
    return await sender.dispatch(data, this.ERROR_QUEUE);
  }
  async success(data) {
    const sender = SenderFactory.create(this.provider, this.connectionString);
    return await sender.dispatch(data, this.SUCCESS_QUEUE);
  }
};
export {
  COMClient,
  COMInternal,
  Email,
  FakerMessageSender,
  SMS,
  Whatsapp
};
