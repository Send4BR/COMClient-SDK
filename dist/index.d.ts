declare module 'comclient-sdk/lib/domain/entities/message/email' {
  import { Message, MessageData } from 'comclient-sdk/lib/domain/entities/message/message';
  type MessageType = {
      from: string;
      subject: string;
      body: string;
  };
  type RecipientType = {
      email: string;
  };
  type EmailData = {
      message: MessageType;
      recipient: RecipientType;
  } & MessageData;
  export class Email extends Message {
      readonly channel: string;
      readonly message: MessageType;
      readonly recipient: RecipientType;
      constructor({ message, recipient, externalId }: EmailData);
  }
  export {};

}
declare module 'comclient-sdk/lib/domain/entities/message/message' {
  export type MessageData = {
      externalId?: string;
  };
  export class Message {
      readonly externalId?: string;
      constructor({ externalId }: MessageData);
  }

}
declare module 'comclient-sdk/lib/domain/protocols/message-dispatcher' {
  export interface MessageDispatcher {
      dispatch(message: unknown, topic: string): Promise<void>;
  }

}
declare module 'comclient-sdk/lib/domain/service/client' {
  import { Email } from 'comclient-sdk/lib/domain/entities/message/email';
  type ClientParams = {
      provider?: string;
      connectionString: string;
      origin: string;
      clientId: string;
  };
  export class COMClient {
      private readonly provider;
      private readonly origin;
      private readonly clientId;
      private readonly MESSAGE_QUEUE;
      private readonly connectionString;
      constructor({ provider, connectionString, origin, clientId }: ClientParams);
      dispatch(message: Email): Promise<void>;
  }
  export {};

}
declare module 'comclient-sdk/lib/domain/service/internal-client' {
  type Params = {
      provider?: string;
      connectionString: string;
  };
  type MessageData = {
      id: string;
      message: string;
  };
  export class COMInternal {
      private readonly provider;
      private readonly ERROR_QUEUE;
      private readonly SUCCESS_QUEUE;
      private readonly connectionString;
      constructor({ provider, connectionString }: Params);
      error(data: MessageData): Promise<void>;
      success(data: MessageData): Promise<void>;
  }
  export {};

}
declare module 'comclient-sdk/lib/errors/provider-not-implemented' {
  export class ProviderNotImplemented extends Error {
      constructor(provider: string);
  }

}
declare module 'comclient-sdk/lib/index' {
  export * from 'comclient-sdk/lib/domain/service/client';
  export * from 'comclient-sdk/lib/domain/entities/message/email';
  export * from 'comclient-sdk/lib/domain/service/internal-client';
  export * from 'comclient-sdk/lib/infra/senders/faker/message';

}
declare module 'comclient-sdk/lib/infra/senders/faker/message' {
  import { MessageDispatcher } from 'comclient-sdk/lib/domain/protocols/message-dispatcher';
  export class FakerMessageSender implements MessageDispatcher {
      static canHandle: string;
      static sender: unknown[];
      dispatch(message: unknown, topic: string): Promise<void>;
      static get messages(): unknown[];
      static cleanMessages(): void;
  }

}
declare module 'comclient-sdk/lib/infra/senders/sender' {
  import { FakerMessageSender } from 'comclient-sdk/lib/infra/senders/faker/message';
  import { MessageServiceBusSender } from 'comclient-sdk/lib/infra/senders/service-bus/message';
  export class SenderFactory {
      static senders: (typeof FakerMessageSender | typeof MessageServiceBusSender)[];
      static create(provider: string, connectionString: string): {
          sender: FakerMessageSender;
      };
  }

}
declare module 'comclient-sdk/lib/infra/senders/service-bus/message' {
  import { ServiceBusClient } from '@azure/service-bus';
  import { MessageDispatcher } from 'comclient-sdk/lib/domain/protocols/message-dispatcher';
  export class MessageServiceBusSender implements MessageDispatcher {
      private client;
      static canHandle: string;
      constructor(client: ServiceBusClient);
      dispatch(message: unknown, topic: string): Promise<void>;
  }

}
declare module 'comclient-sdk/test/domain/service/client.spec' {
  export {};

}
declare module 'comclient-sdk/test/domain/service/internal-client.spec' {
  export {};

}
declare module 'comclient-sdk/test/entities/message/email.spec' {
  export {};

}
declare module 'comclient-sdk/test/fixtures/email' {
  const _default: {
      message: {
          body: string;
          from: string;
          subject: string;
      };
      recipient: {
          email: string;
      };
      externalId: string;
  };
  export default _default;

}
declare module 'comclient-sdk' {
  import main = require('comclient-sdk/lib/index');
  export = main;
}