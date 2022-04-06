import { ServiceBusClient } from '@azure/service-bus'
import { ProviderNotImplemented } from '../../errors/provider-not-implemented'
import { FakerMessageSender } from './faker/message'
import { MessageServiceBusSender } from './service-bus/message'
import { SenderOptions } from './types/sender-options'

export default class SenderFactory {
  public static senders = [MessageServiceBusSender, FakerMessageSender]

  public static create(provider: string, connectionString: string, options?: SenderOptions) {
    const Sender = SenderFactory.senders.find(sender => sender.canHandle === provider)

    switch (Sender) {
      case MessageServiceBusSender:
        return new Sender(new ServiceBusClient(connectionString), options)
      case FakerMessageSender:
        return new Sender()
    }

    throw new ProviderNotImplemented(provider)
  }
}
