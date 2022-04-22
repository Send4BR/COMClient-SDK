export class LinkNotProvidedError extends Error {
  constructor() {
    super('Error: Found link but variable not provided')
  }
}
