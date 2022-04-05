import { Email } from '../../domain/entities/message/email'
import { SMS } from '../../domain/entities/message/sms'
import { Whatsapp } from '../../domain/entities/message/whatsapp'
import { DispatchOptions } from '../../domain/protocols/dispatch-options'
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

  public async dispatch(message: Email | SMS | Whatsapp, options?: DispatchOptions) {
    const sender = SenderFactory.create(this.provider, this.connectionString)

    await sender.dispatch({ ...message.getMessage(), origin: this.origin, clientId: this.clientId }, this.MESSAGE_QUEUE, options)
  }
}
