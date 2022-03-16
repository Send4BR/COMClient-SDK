declare module '@aftersale/comclient-sdk/lib/application/service/client' {
  import { Email } from '@aftersale/comclient-sdk/lib/domain/entities/message/email';
  import { SMS } from '@aftersale/comclient-sdk/lib/domain/entities/message/sms';
  import { Whatsapp } from '@aftersale/comclient-sdk/lib/domain/entities/message/whatsapp';
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
      dispatch(message: Email | SMS | Whatsapp): Promise<void>;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/application/service/internal-client' {
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
  export class Email implements Message {
      readonly channel: string;
      readonly externalId?: string;
      readonly message: MessageType;
      readonly recipient: RecipientType;
      constructor({ message, recipient, externalId }: Pick<EmailData, 'message' | 'recipient' | 'externalId'>);
      getMessage(): EmailData;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/entities/message/message' {
  export type MessageData = {
      externalId?: string;
      channel: string;
  };
  export interface Message {
      externalId?: string;
      channel?: string;
      getMessage(): Partial<MessageData>;
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
  export type SMSData = {
      message: MessageType;
      recipient: RecipientType;
  } & MessageData;
  export class SMS implements Message {
      readonly channel: string;
      readonly externalId?: string;
      private readonly recipient;
      private readonly message;
      private readonly shortifyService;
      constructor({ message, recipient, externalId }: Pick<SMSData, 'message' | 'recipient' | 'externalId'>);
      getMessage(): SMSData;
      shortify(char?: number): void;
      private format;
      private get text();
      private set text(value);
      private get suffix();
      private set suffix(value);
      private get prefix();
      private set prefix(value);
      private get variables();
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
  export class Whatsapp implements Message {
      readonly channel: string;
      readonly externalId?: string;
      readonly message: any;
      readonly recipient: RecipientType;
      constructor({ message, recipient, externalId }: Pick<WhatsappData, 'message' | 'recipient' | 'externalId'>);
      getMessage(): WhatsappData;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/protocols/message-dispatcher' {
  export interface MessageDispatcher {
      dispatch(message: unknown, topic: string): Promise<void>;
  }

}
declare module '@aftersale/comclient-sdk/lib/domain/service/smsshortify' {
  type SMSShortifyType = {
      prefix?: string;
      text: string;
      suffix?: string;
      variables?: string;
      link?: string;
  };
  export class SMSShortify {
      private readonly RESERVED_SPACE_FORMAT;
      private readonly SEE_MORE;
      private readonly LINK_VARIABLE;
      private text;
      private prefix?;
      private suffix?;
      private link?;
      constructor({ text, prefix, suffix, link }: SMSShortifyType);
      execute(char?: number): {
          text: string;
          prefix: string | undefined;
          suffix: string | undefined;
      };
      private createSuffix;
      private get messageSize();
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/errors/provider-not-implemented' {
  export class ProviderNotImplemented extends Error {
      constructor(provider: string);
  }

}
declare module '@aftersale/comclient-sdk/lib/index' {
  export * from '@aftersale/comclient-sdk/lib/application/service/client';
  export * from '@aftersale/comclient-sdk/lib/domain/entities/message/email';
  export * from '@aftersale/comclient-sdk/lib/domain/entities/message/sms';
  export * from '@aftersale/comclient-sdk/lib/domain/entities/message/whatsapp';
  export * from '@aftersale/comclient-sdk/lib/application/service/internal-client';
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