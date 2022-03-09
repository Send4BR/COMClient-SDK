export class ProviderNotImplemented extends Error {
  constructor (provider: string) {
    super(`Provider ${provider} is not implemented`)
  }
}
