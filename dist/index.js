var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
  async dispatch(message2, topic) {
    console.log("sending message to topic " + topic);
    _FakerMessageSender.sender.push(message2);
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
  async dispatch(message2, topic) {
    const sender = this.client.createSender(topic);
    try {
      await sender.sendMessages({
        body: message2,
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
        return new Sender(new import_service_bus.ServiceBusClient(connectionString));
      case FakerMessageSender:
        return new Sender();
    }
    throw new ProviderNotImplemented(provider);
  }
};
var SenderFactory = _SenderFactory;
SenderFactory.senders = [MessageServiceBusSender, FakerMessageSender];

// lib/domain/service/client.ts
var COMClient = class {
  constructor({ environment = "production", provider = "servicebus", connectionString, origin, clientId }) {
    this.provider = provider;
    this.origin = origin;
    this.clientId = clientId;
    this.connectionString = connectionString;
    this.MESSAGE_QUEUE = `${environment}--send-message`;
  }
  async dispatch(message2) {
    const sender = SenderFactory.create(this.provider, this.connectionString);
    await sender.dispatch({ ...message2.getMessage(), origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE);
  }
};

// lib/domain/entities/message/email.ts
var Email = class {
  constructor({ message: message2, recipient, externalId }) {
    this.channel = "email";
    this.externalId = externalId;
    this.message = message2;
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
var import_normalize_text = require("normalize-text");
var SMS = class {
  constructor({ message: message2, recipient, externalId }, options) {
    this.channel = "sms";
    this.RESERVED_SPACE_FORMAT = 3;
    this.SEE_MORE = "... Veja mais em:";
    this.externalId = externalId;
    this.message = this.normalize(message2);
    this.recipient = recipient;
    this.replaceVariables();
    if (options?.shortify) {
      this.shortify(options.char);
    }
    this.build();
  }
  getMessage() {
    return {
      externalId: this.externalId,
      message: { text: this.text },
      channel: this.channel,
      recipient: this.recipient
    };
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
  shortify(char = 160) {
    const LINK = "$link";
    if (this.messageSize > char) {
      this.createSuffix();
      this.text = this.text.replace(LINK, "");
      this.text = this.text = this.text.slice(0, char - ((this.prefix?.length ?? 0) + (this.suffix?.length ?? 0) + this.RESERVED_SPACE_FORMAT));
    } else if (this.variables?.link) {
      this.text = this.text.replace(LINK, this.variables.link);
    }
  }
  createSuffix() {
    this.suffix = this.variables?.link ? `${this.SEE_MORE} ${this.variables?.link}${this.suffix ? ` ${this.suffix}` : ""}` : void 0;
  }
  build() {
    if (!this.prefix && !this.suffix)
      return;
    if (this.prefix && this.suffix)
      this.text = `${this.prefix}: ${this.text} ${this.suffix}`;
    if (!this.prefix)
      this.text = `${this.text} ${this.suffix}`;
    if (!this.suffix)
      this.text = `${this.prefix}: ${this.text}`;
    this.prefix = void 0;
    this.suffix = void 0;
  }
  get messageSize() {
    const SMS_LINK_MAX_SIZE = 30;
    return (this.message.prefix?.length ?? 0) + (this.message.suffix?.length ?? 0) + this.message.text.length + SMS_LINK_MAX_SIZE;
  }
  replaceVariables() {
    const variables = this.variables ?? {};
    Object.keys(this.variables ?? {}).map((key) => {
      if (key !== "link") {
        this.text = this.text.replace("$" + key, variables[key]);
      }
    });
  }
  normalize(message2) {
    return {
      text: (0, import_normalize_text.normalizeDiacritics)(message2.text),
      suffix: message2.suffix ? (0, import_normalize_text.normalizeDiacritics)(message2.suffix) : void 0,
      prefix: message2.prefix ? (0, import_normalize_text.normalizeDiacritics)(message2.prefix) : void 0,
      variables: message2.variables
    };
  }
};
var message = new SMS({
  message: {
    prefix: "STORE TANANANA",
    text: "Hello World!",
    suffix: "PEDIDO #123",
    variables: {
      chave: "valor"
    }
  },
  recipient: {
    phone: "N\xFAmero onde a mensagem ser\xE1 enviada."
  },
  externalId: "1234"
}, {
  shortify: true,
  char: 160
});

// lib/domain/entities/message/whatsapp.ts
var Whatsapp = class {
  constructor({ message: message2, recipient, externalId }) {
    this.channel = "whatsapp";
    this.externalId = externalId;
    this.message = message2;
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

// lib/domain/service/internal-client.ts
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
