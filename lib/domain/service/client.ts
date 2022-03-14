import { Email } from '../entities/message/email'
import SenderFactory from '../../infra/senders/sender-factory'

type ClientParams = {
  environment?: string;
  provider?: string;
  connectionString: string;
  origin: string;
  clientId: string;
};

export class COMClient {
  private readonly provider: string
  private readonly origin: string
  private readonly clientId: string
  private readonly MESSAGE_QUEUE: string
  private readonly connectionString: string

  constructor({ environment = 'production', provider = 'servicebus', connectionString, origin, clientId }: ClientParams) {
    this.provider = provider
    this.origin = origin
    this.clientId = clientId
    this.connectionString = connectionString
    this.MESSAGE_QUEUE = `${environment}--send-message`
  }

  public async dispatch(message: Email) {
    const sender = SenderFactory.create(this.provider, this.connectionString)

    await sender.dispatch({ ...message, origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE)
  }
}
