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
  Email: () => Email
});

// lib/infra/senders/sender.ts
var import_service_bus = require("@azure/service-bus");

// lib/errors/provider-not-implemented.ts
var ProviderNotImplemented = class extends Error {
  constructor(provider) {
    super(`Provider ${provider} is not implemented`);
  }
};

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

// lib/infra/senders/sender.ts
var SenderFactory = class {
  static createClient(provider, connectionString) {
    const client = {
      servicebus: new import_service_bus.ServiceBusClient(connectionString)
    }[provider];
    if (!client)
      throw new ProviderNotImplemented(provider);
    return client;
  }
  static createDispatcher(provider) {
    const sender = {
      servicebus: MessageServiceBusSender
    }[provider];
    if (!sender)
      throw new ProviderNotImplemented(provider);
    return sender;
  }
};

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
    const client = SenderFactory.createClient(this.provider, this.connectionString);
    const Sender = SenderFactory.createDispatcher(this.provider);
    const dispatcher = new Sender(client);
    await dispatcher.dispatch({ ...message, origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE);
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
module.exports = __toCommonJS(lib_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COMClient,
  Email
});
