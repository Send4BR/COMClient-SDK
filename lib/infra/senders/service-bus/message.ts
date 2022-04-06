import { ServiceBusClient } from '@azure/service-bus'
import { MessageDispatcher } from '../../../domain/protocols/message-dispatcher'
import { Logger } from '../../../utils/logs/logger'
import { SenderOptions } from '../types/sender-options'

export class MessageServiceBusSender implements MessageDispatcher {
  public static canHandle = 'servicebus'
  private logger: Logger

  constructor(private client: ServiceBusClient, options?: SenderOptions) {
    this.logger = new Logger(options?.silent)
  }

  async dispatch(message: unknown, topic: string): Promise<void> {
    const sender = this.client.createSender(topic)

    try {
      this.logger.info(`sending message ${JSON.stringify(message)} on topic ${topic}`)
      await sender.sendMessages({
        body: message,
        contentType: 'application/json'
      })
    } catch (err) {
      this.logger.error(JSON.stringify(err))
    } finally {
      await sender.close()
      await this.client.close()
    }
  }
}
