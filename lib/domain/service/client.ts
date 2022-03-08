import { Email } from '../entities/message/email'
import { SenderFactory } from '../../infra/senders/sender'

type ClientParams = {
  provider?: string
  connectionString: string;
  origin: string;
  clientId: string;
};

export class COMClient {
  private readonly provider: string
  private readonly origin: string
  private readonly clientId: string
  private readonly MESSAGE_QUEUE: string = 'send-message'
  private readonly connectionString: string

  constructor({ provider = 'servicebus', connectionString, origin, clientId }: ClientParams) {
    this.provider = provider
    this.origin = origin
    this.clientId = clientId
    this.connectionString = connectionString
  }

  public async dispatch(message: Email) {
    const client = SenderFactory.createClient(this.provider, this.connectionString)
    const Sender = SenderFactory.createDispatcher(this.provider)

    const dispatcher = new Sender(client)

    await dispatcher.dispatch({ ...message, origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE)
  }
}