
import { DispatchOptions } from '../../../domain/protocols/dispatch-options'
import { MessageDispatcher } from '../../../domain/protocols/message-dispatcher'

export class FakerMessageSender implements MessageDispatcher {
  public static canHandle = 'faker'
  public static sender: { message: unknown, options?: DispatchOptions }[] = []

  async dispatch(message: unknown, topic: string, options?: DispatchOptions): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('sending message to topic ' + topic)
    FakerMessageSender.sender.push({ message, options })
  }

  public static get messages() {
    return this.sender
  }

  public static cleanMessages() {
    this.sender = []
  }
}
