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
  FakerMessageSender: () => FakerMessageSender
});

// lib/infra/senders/sender.ts
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

// lib/infra/senders/sender.ts
var _SenderFactory = class {
  static create(provider, connectionString) {
    const Sender = _SenderFactory.senders.find((sender) => sender.canHandle === provider);
    if (Sender === MessageServiceBusSender) {
      const client = new import_service_bus.ServiceBusClient(connectionString);
      return {
        sender: new Sender(client)
      };
    }
    if (Sender === FakerMessageSender) {
      return {
        sender: new Sender()
      };
    }
    throw new ProviderNotImplemented(provider);
  }
};
var SenderFactory = _SenderFactory;
SenderFactory.senders = [MessageServiceBusSender, FakerMessageSender];

// lib/domain/service/client.ts
var COMClient = class {
  constructor({ provider = "servicebus", connectionString, origin, clientId }) {
    this.MESSAGE_QUEUE = "send-message";
    this.provider = provider;
    this.origin = origin;
    this.clientId = clientId;
    this.connectionString = connectionString;
  }
  async dispatch(message) {
    const { sender } = SenderFactory.create(this.provider, this.connectionString);
    await sender.dispatch({ ...message, origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE);
  }
};

// lib/domain/entities/message/message.ts
var Message = class {
  constructor({ externalId }) {
    this.externalId = externalId;
  }
};

// lib/domain/entities/message/email.ts
var Email = class extends Message {
  constructor({ message, recipient, externalId }) {
    super({ externalId });
    this.channel = "email";
    this.message = message;
    this.recipient = recipient;
  }
};

// lib/domain/service/internal-client.ts
var COMInternal = class {
  constructor({ provider = "servicebus", connectionString }) {
    this.ERROR_QUEUE = "message-fail";
    this.SUCCESS_QUEUE = "message-success";
    this.provider = provider;
    this.connectionString = connectionString;
  }
  async error(data) {
    const { sender } = SenderFactory.create(this.provider, this.connectionString);
    return await sender.dispatch(data, this.ERROR_QUEUE);
  }
  async success(data) {
    const { sender } = SenderFactory.create(this.provider, this.connectionString);
    return await sender.dispatch(data, this.SUCCESS_QUEUE);
  }
};
module.exports = __toCommonJS(lib_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COMClient,
  COMInternal,
  Email,
  FakerMessageSender
});
