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

// lib/domain/service/client.ts
var COMClient = class {
  constructor({ environment = "production", provider = "servicebus", connectionString, origin, clientId }) {
    this.provider = provider;
    this.origin = origin;
    this.clientId = clientId;
    this.connectionString = connectionString;
    this.MESSAGE_QUEUE = `${environment}-send-message`;
  }
  async dispatch(message) {
    const sender = SenderFactory.create(this.provider, this.connectionString);
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
  constructor({ environment = "production", provider = "servicebus", connectionString }) {
    this.provider = provider;
    this.connectionString = connectionString;
    this.ERROR_QUEUE = `${environment}-message-fail`;
    this.SUCCESS_QUEUE = `${environment}-message-success`;
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
  FakerMessageSender
};
