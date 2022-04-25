var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  COMClient: () => COMClient,
  COMInternal: () => COMInternal,
  Email: () => Email,
  FakerMessageSender: () => FakerMessageSender,
  SMS: () => SMS,
  Whatsapp: () => Whatsapp
});

// lib/infra/senders/sender-factory.ts
var import_service_bus = require("@azure/service-bus");

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
var import_pino = __toESM(require("pino"));
var Logger = class {
  constructor(silent = false) {
    this.silent = silent;
    this.logger = (0, import_pino.default)();
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
        return new Sender(new import_service_bus.ServiceBusClient(connectionString), options);
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
  }
};

// lib/domain/entities/message/email.ts
var Email = class {
  constructor({ message, recipient, externalId, scheduledTo }) {
    this.channel = "email";
    this.externalId = externalId;
    this.message = message;
    this.recipient = recipient;
    this.scheduledTo = scheduledTo?.toISOString();
  }
  getMessage() {
    return {
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message,
      scheduledTo: this.scheduledTo
    };
  }
};

// lib/domain/entities/message/sms.ts
var import_normalize_text = require("normalize-text");

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

// lib/domain/errors/link-not-provided.ts
var LinkNotProvidedError = class extends Error {
  constructor() {
    super("Error: Found link but variable not provided");
  }
};

// lib/domain/entities/message/sms.ts
var SMS = class {
  constructor({ message, recipient, externalId, scheduledTo }) {
    this.channel = "sms";
    this.externalId = externalId;
    this.message = this.normalize(message);
    this.recipient = recipient;
    this.scheduledTo = scheduledTo?.toISOString();
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
      externalId: this.externalId,
      message: {
        text: this.text
      },
      channel: this.channel,
      recipient: this.recipient,
      scheduledTo: this.scheduledTo
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
      text: (0, import_normalize_text.normalizeDiacritics)(message.text),
      suffix: message.suffix ? (0, import_normalize_text.normalizeDiacritics)(message.suffix) : void 0,
      prefix: message.prefix ? (0, import_normalize_text.normalizeDiacritics)(message.prefix) : void 0,
      variables: message.variables
    };
  }
  verify() {
    if (this.message.text.includes("$link") && !this.message.variables?.link)
      throw new LinkNotProvidedError();
  }
};

// lib/domain/entities/message/whatsapp.ts
var Whatsapp = class {
  constructor({
    message,
    recipient,
    externalId,
    scheduledTo
  }) {
    this.channel = "whatsapp";
    this.externalId = externalId;
    this.message = message;
    this.recipient = recipient;
    this.scheduledTo = scheduledTo?.toISOString();
  }
  getMessage() {
    return {
      channel: this.channel,
      externalId: this.externalId,
      recipient: this.recipient,
      message: this.message,
      scheduledTo: this.scheduledTo
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
    this.TEMPLATE_UPDATED_QUEUE = `${environment}--template-updated`;
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
};
module.exports = __toCommonJS(lib_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COMClient,
  COMInternal,
  Email,
  FakerMessageSender,
  SMS,
  Whatsapp
});
