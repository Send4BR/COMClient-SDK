export interface MessageDispatcher {
 dispatch(message: unknown, topic: string): Promise<void>
}
