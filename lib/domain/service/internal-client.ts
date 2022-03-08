import { SenderFactory } from '../../infra/senders/sender'

type Params = {
  provider?: string
  connectionString: string;
};

type MessageData = {id: string, message: string}

export class COMInternal {
  private readonly provider: string
  private readonly ERROR_QUEUE: string = 'any'
  private readonly SUCCESS_QUEUE: string = 'any'
  private readonly connectionString: string

  constructor({ provider = 'servicebus', connectionString }: Params) {
    this.provider = provider
    this.connectionString = connectionString
  }

  public async error(data: MessageData) {
    const client = SenderFactory.createClient(this.provider, this.connectionString)
    const Sender = SenderFactory.createDispatcher(this.provider)

    const dispatcher = new Sender(client)
    return dispatcher.dispatch(data, this.ERROR_QUEUE)
  }

  public async success(data: MessageData) {
    const client = SenderFactory.createClient(this.provider, this.connectionString)
    const Sender = SenderFactory.createDispatcher(this.provider)

    const dispatcher = new Sender(client)
    return dispatcher.dispatch(data, this.SUCCESS_QUEUE)
  }
}
