import { WhatsappData } from '../../lib'

export const whatsappTextTest = {
  message: { type: 'text', text: 'SDK Test' },
  recipient: { phone: '5541000000000' },
  externalId: '123'
} as Partial<WhatsappData>

export const whatsappTemplateTest = {
  message: {
    type: 'template',
    template: 'template-1',
    fields: { name: 'João Claudio', company: 'Andaimes JC', description: 'Joao Claudio do Andaime' }
  },
  recipient: { phone: '5541000000000' },
  externalId: '123'
} as Partial<WhatsappData>
