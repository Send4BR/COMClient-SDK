declare module '@aftersale/comclient-sdk/lib/domain/entities/message/email' {
  import { Message, MessageData } from '@aftersale/comclient-sdk/lib/domain/entities/message/message';
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
declare module '@aftersale/comclient-sdk/lib/domain/entities/message/message' {
  export type MessageData = {
      externalId?: string;
  };
  export class Message {
      readonly externalId?: string;
      constructor({ externalId }: MessageData);
  }

}
declare module '@aftersale/comclient-sdk/lib/domain/entities/message/sms' {
  import { Message, MessageData } from '@aftersale/comclient-sdk/lib/domain/entities/message/message';
  type MessageType = {
      prefix?: string;
      text: string;
      suffix?: string;
      variables?: Record<string, string>;
  };
  type RecipientType = {
      phone: string;
  };
  type SMSData = {
      message: MessageType;
      recipient: RecipientType;
  } & MessageData;
  export class SMS extends Message {
      private readonly message;
      readonly channel: string;
      readonly recipient: RecipientType;
      constructor({ message, recipient, externalId }: SMSData);
      get text(): string;
      private set text(value);
      get suffix(): string | undefined;
      private set suffix(value);
      get prefix(): string | undefined;
      private set prefix(value);
      private get variables();
      shortify(char?: number): void;
      private build;
      private get messageSize();
      private replaceVariables;
      private normalize;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/entities/message/whatsapp' {
  import { Message, MessageData } from '@aftersale/comclient-sdk/lib/domain/entities/message/message';
  type RecipientType = {
      phone: string;
  };
  type WhatsappData = {
      message: any;
      recipient: RecipientType;
  } & MessageData;
  export class Whatsapp extends Message {
      readonly channel: string;
      readonly message: any;
      readonly recipient: RecipientType;
      constructor({ message, recipient, externalId }: WhatsappData);
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/protocols/message-dispatcher' {
  export interface MessageDispatcher {
      dispatch(message: unknown, topic: string): Promise<void>;
  }

}
declare module '@aftersale/comclient-sdk/lib/domain/service/client' {
  import { Email } from '@aftersale/comclient-sdk/lib/domain/entities/message/email';
  type ClientParams = {
      environment?: string;
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
      constructor({ environment, provider, connectionString, origin, clientId }: ClientParams);
      dispatch(message: Email): Promise<void>;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/service/internal-client' {
  type Params = {
      environment?: string;
      provider?: string;
      connectionString: string;
  };
  type MessageData = {
      id: string;
      error?: string;
      sentAt?: number;
  };
  export class COMInternal {
      private readonly provider;
      private readonly ERROR_QUEUE;
      private readonly SUCCESS_QUEUE;
      private readonly connectionString;
      constructor({ environment, provider, connectionString }: Params);
      error(data: MessageData): Promise<void>;
      success(data: MessageData): Promise<void>;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/errors/provider-not-implemented' {
  export class ProviderNotImplemented extends Error {
      constructor(provider: string);
  }

}
declare module '@aftersale/comclient-sdk/lib/index' {
  export * from '@aftersale/comclient-sdk/lib/domain/service/client';
  export * from '@aftersale/comclient-sdk/lib/domain/entities/message/email';
  export * from '@aftersale/comclient-sdk/lib/domain/service/internal-client';
  export * from '@aftersale/comclient-sdk/lib/infra/senders/faker/message';

}
declare module '@aftersale/comclient-sdk/lib/infra/senders/faker/message' {
  import { MessageDispatcher } from '@aftersale/comclient-sdk/lib/domain/protocols/message-dispatcher';
  export class FakerMessageSender implements MessageDispatcher {
      static canHandle: string;
      static sender: unknown[];
      dispatch(message: unknown, topic: string): Promise<void>;
      static get messages(): unknown[];
      static cleanMessages(): void;
  }

}
declare module '@aftersale/comclient-sdk/lib/infra/senders/sender-factory' {
  import { FakerMessageSender } from '@aftersale/comclient-sdk/lib/infra/senders/faker/message';
  import { MessageServiceBusSender } from '@aftersale/comclient-sdk/lib/infra/senders/service-bus/message';
  export default class SenderFactory {
      static senders: (typeof FakerMessageSender | typeof MessageServiceBusSender)[];
      static create(provider: string, connectionString: string): FakerMessageSender | MessageServiceBusSender;
  }

}
declare module '@aftersale/comclient-sdk/lib/infra/senders/service-bus/message' {
  import { ServiceBusClient } from '@azure/service-bus';
  import { MessageDispatcher } from '@aftersale/comclient-sdk/lib/domain/protocols/message-dispatcher';
  export class MessageServiceBusSender implements MessageDispatcher {
      private client;
      static canHandle: string;
      constructor(client: ServiceBusClient);
      dispatch(message: unknown, topic: string): Promise<void>;
  }

}
declare module '@aftersale/comclient-sdk/test/domain/service/client.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/domain/service/internal-client.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/entities/message/email.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/entities/message/sms.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/fixtures/email' {
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
declare module '@aftersale/comclient-sdk' {
  import main = require('@aftersale/comclient-sdk/lib/index');
  export = main;
}