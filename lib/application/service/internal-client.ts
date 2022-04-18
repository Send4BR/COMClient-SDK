import SenderFactory from '../../infra/senders/sender-factory'
import { SenderOptions } from '../../infra/senders/types/sender-options'

type Params = {
  environment?: string;
  provider?: string;
  connectionString: string;
  options?: SenderOptions;
};

export type MessageData = {
  id: string,
  error?: string,
  sentAt?: Date,
  retrievable?: boolean
}

type Success = Omit<MessageData, 'sentAt'> & {sentAt: Date}

export type TemplateCreated = {
  id: string,
  providerId: string
}

export type TemplateUpdated = {
  id: string,
  status: 'approved' | 'negated',
}

export class COMInternal {
  private senderOptions?: SenderOptions
  private readonly provider: string
  private readonly ERROR_QUEUE: string
  private readonly SUCCESS_QUEUE: string
  private readonly TEMPLATE_CREATED_QUEUE: string
  private readonly TEMPLATE_UPDATED_QUEUE: string

  private readonly connectionString: string

  constructor({ environment = 'production', provider = 'servicebus', connectionString, options }: Params) {
    this.provider = provider
    this.senderOptions = options
    this.connectionString = connectionString
    this.ERROR_QUEUE = `${environment}--message-fail`
    this.SUCCESS_QUEUE = `${environment}--message-success`
    this.TEMPLATE_CREATED_QUEUE = `${environment}--template-created`
    this.TEMPLATE_UPDATED_QUEUE = `${environment}--template-updated`
  }

  public async error(data: MessageData) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions)

    return await sender.dispatch({ ...data, sentAt: data.sentAt?.toISOString() }, this.ERROR_QUEUE)
  }

  public async success(data: Success) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions)

    return await sender.dispatch({ ...data, sentAt: data.sentAt.toISOString() }, this.SUCCESS_QUEUE)
  }

  public async templateCreated(data: TemplateCreated) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions)

    return await sender.dispatch({ ...data }, this.TEMPLATE_CREATED_QUEUE)
  }

  public async templateUpdated(data: TemplateUpdated) {
    const sender = SenderFactory.create(this.provider, this.connectionString, this.senderOptions)

    return await sender.dispatch({ ...data }, this.TEMPLATE_UPDATED_QUEUE)
  }
}
