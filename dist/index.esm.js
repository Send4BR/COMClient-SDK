// lib/infra/senders/sender.ts
import { ServiceBusClient } from "@azure/service-bus";

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
      servicebus: new ServiceBusClient(connectionString)
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
export {
  COMClient,
  Email
};
