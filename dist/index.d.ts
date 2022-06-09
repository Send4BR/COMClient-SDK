declare module '@aftersale/comclient-sdk/lib/application/service/client' {
  import { Email } from '@aftersale/comclient-sdk/lib/domain/entities/message/email';
  import { SMS } from '@aftersale/comclient-sdk/lib/domain/entities/message/sms';
  import { Whatsapp } from '@aftersale/comclient-sdk/lib/domain/entities/message/whatsapp';
  import { SenderOptions } from '@aftersale/comclient-sdk/lib/infra/senders/types/sender-options';
  type ClientParams = {
      environment?: string;
      provider?: string;
      connectionString: string;
      origin: string;
      clientId: string;
      options?: SenderOptions;
  };
  export class COMClient {
      private readonly provider;
      private readonly origin;
      private readonly clientId;
      private readonly MESSAGE_QUEUE;
      private readonly connectionString;
      private senderOptions?;
      constructor({ environment, provider, connectionString, origin, clientId, options }: ClientParams);
      dispatch(message: Email | SMS | Whatsapp): Promise<string>;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/application/service/internal-client' {
  import { SenderOptions } from '@aftersale/comclient-sdk/lib/infra/senders/types/sender-options';
  type Params = {
      environment?: string;
      provider?: string;
      connectionString: string;
      options?: SenderOptions;
  };
  export type MessageData = {
      id: string;
      error?: string;
      sentAt?: Date;
      retrievable?: boolean;
  };
  type Success = Omit<MessageData, 'sentAt'> & {
      sentAt: Date;
  };
  export type TemplateCreated = {
      id: string;
      providerId: string;
      namespace?: string;
  };
  export type TemplateUpdated = {
      id: string;
      status: 'approved' | 'submitted' | 'rejected';
  };
  export type MessageReceived = {
      from: string;
      text: string;
      timestamp: string;
      clientId?: string;
      profileName: string;
  };
  export class COMInternal {
      private senderOptions?;
      private readonly provider;
      private readonly ERROR_QUEUE;
      private readonly SUCCESS_QUEUE;
      private readonly TEMPLATE_CREATED_QUEUE;
      private readonly TEMPLATE_UPDATED_QUEUE;
      private readonly MESSAGE_RECEIVED;
      private readonly connectionString;
      constructor({ environment, provider, connectionString, options }: Params);
      error(data: MessageData): Promise<void>;
      success(data: Success): Promise<void>;
      templateCreated(data: TemplateCreated): Promise<void>;
      templateUpdated(data: TemplateUpdated): Promise<void>;
      messageReceived(data: MessageReceived): Promise<void>;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/entities/message/email' {
  import { Message, MessageData } from '@aftersale/comclient-sdk/lib/domain/entities/message/message';
  type MessageType = {
      from: string;
      subject: string;
      body: string;
      cc?: string[];
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
      readonly externalId?: string;
      readonly message: MessageType;
      readonly recipient: RecipientType;
      readonly scheduledTo?: string;
      readonly replyingTo?: string;
      constructor({ message, recipient, externalId, scheduledTo, replyingTo }: Pick<EmailData, 'message' | 'recipient' | 'externalId' | 'scheduledTo' | 'replyingTo'>);
      getMessage(): {
          id: string;
          channel: string;
          externalId: string | undefined;
          recipient: RecipientType;
          message: MessageType;
          scheduledTo: string | undefined;
          replyingTo: string | undefined;
      };
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/entities/message/message' {
  export type MessageData = {
      externalId?: string;
      channel: string;
      scheduledTo?: Date;
      replyingTo?: string;
  };
  export abstract class Message {
      externalId?: string;
      replyingTo?: string;
      channel?: string;
      scheduledTo?: string;
      id: string;
      constructor();
      abstract getMessage(): Partial<Omit<MessageData, 'scheduledTo'>> & {
          scheduledTo?: string;
      };
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
  export class SMS extends Message {
      readonly channel: string;
      readonly externalId?: string;
      readonly scheduledTo?: string;
      private readonly recipient;
      private readonly message;
      private readonly shortifyService;
      readonly replyingTo?: string;
      constructor({ message, recipient, externalId, scheduledTo, replyingTo }: Pick<SMSData, 'message' | 'recipient' | 'externalId' | 'scheduledTo' | 'replyingTo'>);
      getMessage(): {
          id: string;
          externalId: string | undefined;
          message: {
              text: string;
          };
          channel: string;
          recipient: RecipientType;
          scheduledTo: string | undefined;
          replyingTo: string | undefined;
      };
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
      private verify;
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/entities/message/whatsapp' {
  import { Message, MessageData } from '@aftersale/comclient-sdk/lib/domain/entities/message/message';
  type Text = {
      type: 'text';
      text: string;
  };
  type Template = {
      type: 'template';
      template: string;
      fields: Record<string, string>;
  };
  type MessageType = Template | Text;
  type RecipientType = {
      phone: string;
  };
  export type WhatsappData = {
      message: MessageType;
      recipient: RecipientType;
  } & MessageData;
  export class Whatsapp extends Message {
      readonly channel: string;
      readonly externalId?: string;
      readonly message: MessageType;
      readonly scheduledTo?: string;
      readonly recipient: RecipientType;
      readonly replyingTo?: string;
      constructor({ message, recipient, externalId, scheduledTo, replyingTo }: Pick<WhatsappData, 'message' | 'recipient' | 'externalId' | 'scheduledTo' | 'replyingTo'>);
      getMessage(): {
          id: string;
          channel: string;
          externalId: string | undefined;
          recipient: RecipientType;
          message: MessageType;
          scheduledTo: string | undefined;
          replyingTo: string | undefined;
      };
  }
  export {};

}
declare module '@aftersale/comclient-sdk/lib/domain/errors/link-not-provided' {
  export class LinkNotProvidedError extends Error {
      constructor();
  }

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
      private calculateSlice;
      private createSuffix;
      private get replacedText();
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
  import { SenderOptions } from '@aftersale/comclient-sdk/lib/infra/senders/types/sender-options';
  export default class SenderFactory {
      static senders: (typeof FakerMessageSender | typeof MessageServiceBusSender)[];
      static create(provider: string, connectionString: string, options?: SenderOptions): FakerMessageSender | MessageServiceBusSender;
  }

}
declare module '@aftersale/comclient-sdk/lib/infra/senders/service-bus/message' {
  import { ServiceBusClient } from '@azure/service-bus';
  import { MessageDispatcher } from '@aftersale/comclient-sdk/lib/domain/protocols/message-dispatcher';
  import { SenderOptions } from '@aftersale/comclient-sdk/lib/infra/senders/types/sender-options';
  export class MessageServiceBusSender implements MessageDispatcher {
      private client;
      static canHandle: string;
      private logger;
      constructor(client: ServiceBusClient, options?: SenderOptions);
      dispatch(message: unknown, topic: string): Promise<void>;
  }

}
declare module '@aftersale/comclient-sdk/lib/infra/senders/types/sender-options' {
  export type SenderOptions = {
      silent?: boolean;
  };

}
declare module '@aftersale/comclient-sdk/lib/utils/logger/logger' {
  import { Logger as PinoLogger } from 'pino';
  export class Logger {
      private silent;
      logger: PinoLogger;
      constructor(silent?: boolean);
      info(message: string): void;
      error(message: string): void;
  }

}
declare module '@aftersale/comclient-sdk/test/domain/service/client.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/domain/service/internal-client.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/domain/service/smsshortify.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/entities/message/email.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/entities/message/sms.spec' {
  export {};

}
declare module '@aftersale/comclient-sdk/test/entities/message/whatsapp.spec' {
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
declare module '@aftersale/comclient-sdk/test/fixtures/whatsapp' {
  import { WhatsappData } from '@aftersale/comclient-sdk/lib/index';
  export const whatsappTextTest: Partial<WhatsappData>;
  export const whatsappTemplateTest: Partial<WhatsappData>;

}
declare module '@aftersale/comclient-sdk' {
  import main = require('@aftersale/comclient-sdk/lib/index');
  export = main;
}