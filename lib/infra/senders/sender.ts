import { ServiceBusClient } from '@azure/service-bus'
import { ProviderNotImplemented } from '../../errors/provider-not-implemented'
import { MessageServiceBusSender } from './service-bus/message'

export class SenderFactory {
  public static createClient(provider: string, connectionString: string) {
    const client = {
      servicebus: new ServiceBusClient(connectionString)
    }[provider]

    if (!client) throw new ProviderNotImplemented(provider)

    return client
  }

  public static createDispatcher(provider: string) {
    const sender = {
      servicebus: MessageServiceBusSender
    }[provider]

    if (!sender) throw new ProviderNotImplemented(provider)

    return sender
  }
}
