import { DispatchOptions } from './dispatch-options'

export interface MessageDispatcher {
  dispatch(message: unknown, topic: string, options?: DispatchOptions): Promise<void>
}
