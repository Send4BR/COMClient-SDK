export interface MessageDispatcher {
 dispatch(message: any, topic: string): Promise<void>
}
