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

// lib/utils/logger/logger.ts
import pino from "pino";
var Logger = class {
  constructor(silent = false) {
    this.silent = silent;
    this.logger = pino();
  }
  info(message) {
    if (this.silent)
      return;
    this.logger.info(message);
  }
  error(message) {
    if (this.silent)
      return;
    this.logger.error(message);
  }
};

// lib/infra/senders/service-bus/message.ts
var MessageServiceBusSender = class {
  constructor(client, options) {
    this.client = client;
    this.logger = new Logger(options?.silent);
  }
  async dispatch(message, topic) {
    const sender = this.client.createSender(topic);
    try {
      this.logger.info(`sending message ${JSON.stringify(message)} on topic ${topic}`);
      await sender.sendMessages({
        body: message,
        contentType: "application/json"
      });
    } catch (err) {
      this.logger.error(JSON.stringify(err));
    } finally {
      await sender.close();
      await this.client.close();
    }
  }
};
MessageServiceBusSender.canHandle = "servicebus";

// lib/infra/senders/sender-factory.ts
var _SenderFactory = class {
  static create(provider, connectionString, options) {
    const Sender = _SenderFactory.senders.find((sender) => sender.canHandle === provider);
    switch (Sender) {
      case MessageServiceBusSender:
        return new Sender(new ServiceBusClient(connectionString), options);
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
  constructor({ environment = "production", provider = "servicebus", connectionString, origin, clientId, options }) {
    this.provider = provider;
    this.senderOptions = options;
    this.origin = origin;
    this.clientId = clientId;
    this.connectionString = connectionString;
    this.MESSAGE_QUEUE = `${environment}--send-message`;
  }
  async dispatch(message) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions);
    await sender.dispatch({ ...message.getMessage(), origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE);
    return message.id;
  }
};

// lib/domain/entities/message/message.ts
import crypto from "crypto";
var Message = class {
  constructor() {
    this.id = crypto.randomUUID();
  }
};

// lib/domain/entities/message/email.ts
var Email = class extends Message {
  constructor({
    message,
    recipient,
    externalId,
    scheduledTo,
    replyingTo
  }) {
    super();
    this.channel = "email";
    this.externalId = externalId;
    this.message = message;
    this.recipient = recipient;
    this.scheduledTo = scheduledTo?.toISOString();
    this.replyingTo = replyingTo;
  }
  getMessage() {
    return {
      id: this.id,
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message,
      scheduledTo: this.scheduledTo,
      replyingTo: this.replyingTo
    };
  }
};

// lib/domain/entities/message/sms.ts
import { normalizeDiacritics } from "normalize-text";

// lib/domain/errors/link-not-provided.ts
var LinkNotProvidedError = class extends Error {
  constructor() {
    super("Error: Found link but variable not provided");
  }
};

// lib/domain/service/smsshortify.ts
var SMSShortify = class {
  constructor({ text, prefix, suffix, link }) {
    this.RESERVED_SPACE_FORMAT = 2;
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
    this.text = this.replacedText;
    return { text: this.text, prefix: this.prefix, suffix: this.suffix };
  }
  calculateSlice(char) {
    return char - ((this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.RESERVED_SPACE_FORMAT);
  }
  createSuffix() {
    if (!this.link)
      return;
    const complement = `${this.SEE_MORE} ${this.link}`;
    if (!this.suffix) {
      this.suffix = complement;
      return;
    }
    this.suffix = `${complement} ${this.suffix}`;
  }
  get replacedText() {
    if (!this.link)
      return this.text;
    return this.text.replace(this.LINK_VARIABLE, this.link);
  }
  get messageSize() {
    return (this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.replacedText.length;
  }
};

// lib/domain/entities/message/sms.ts
var SMS = class extends Message {
  constructor({ message, recipient, externalId, scheduledTo, replyingTo }) {
    super();
    this.channel = "sms";
    this.externalId = externalId;
    this.message = this.normalize(message);
    this.recipient = recipient;
    this.scheduledTo = scheduledTo?.toISOString();
    this.replyingTo = replyingTo;
    this.replaceVariables();
    this.shortifyService = new SMSShortify({
      text: this.text,
      prefix: this.prefix,
      suffix: this.suffix,
      link: this.variables?.link
    });
    this.verify();
  }
  getMessage() {
    this.format();
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
    };
  }
  shortify(char = 160) {
    const { text, prefix, suffix } = this.shortifyService.execute(char);
    this.text = text;
    this.prefix = prefix;
    this.suffix = suffix;
  }
  format() {
    this.text = `${this.prefix ?? ""} ${this.text} ${this.suffix ?? ""}`.trim();
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
  verify() {
    if (this.message.text.includes("$link") && !this.message.variables?.link)
      throw new LinkNotProvidedError();
  }
};

// lib/domain/entities/message/whatsapp.ts
var Whatsapp = class extends Message {
  constructor({
    message,
    recipient,
    externalId,
    scheduledTo,
    replyingTo
  }) {
    super();
    this.channel = "whatsapp";
    this.externalId = externalId;
    this.message = message;
    this.recipient = recipient;
    this.scheduledTo = scheduledTo?.toISOString();
    this.replyingTo = replyingTo;
  }
  getMessage() {
    return {
      id: this.id,
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message,
      scheduledTo: this.scheduledTo,
      replyingTo: this.replyingTo
    };
  }
};

// lib/application/service/internal-client.ts
var COMInternal = class {
  constructor({ environment = "production", provider = "servicebus", connectionString, options }) {
    this.provider = provider;
    this.senderOptions = options;
    this.connectionString = connectionString;
    this.ERROR_QUEUE = `${environment}--message-fail`;
    this.SUCCESS_QUEUE = `${environment}--message-success`;
    this.TEMPLATE_CREATED_QUEUE = `${environment}--template-created`;
    this.TEMPLATE_UPDATED_QUEUE = `${environment}--template-status`;
    this.MESSAGE_RECEIVED = `${environment}--receive-message`;
  }
  async error(data) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions);
    return await sender.dispatch({ ...data, sentAt: data.sentAt?.toISOString() }, this.ERROR_QUEUE);
  }
  async success(data) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions);
    return await sender.dispatch({ ...data, sentAt: data.sentAt.toISOString() }, this.SUCCESS_QUEUE);
  }
  async templateCreated(data) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions);
    return await sender.dispatch({ ...data }, this.TEMPLATE_CREATED_QUEUE);
  }
  async templateUpdated(data) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions);
    return await sender.dispatch({ ...data }, this.TEMPLATE_UPDATED_QUEUE);
  }
  async messageReceived(data) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions);
    return await sender.dispatch({ ...data }, this.MESSAGE_RECEIVED);
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
