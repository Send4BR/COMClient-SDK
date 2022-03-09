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
    const { sender } = SenderFactory.create(this.provider, this.connectionString)

    return sender.dispatch(data, this.ERROR_QUEUE)
  }

  public async success(data: MessageData) {
    const { sender } = SenderFactory.create(this.provider, this.connectionString)

    return sender.dispatch(data, this.SUCCESS_QUEUE)
  }
}
