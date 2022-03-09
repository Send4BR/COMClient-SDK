import { COMInternal } from 'comclient-sdk'

const client = new COMInternal({
  provider: 'faker',
  connectionString: 'super_secret'
})

await client.error({
  id: '0123',
  message: 'example error'
})

await client.success({
  id: '0123',
  message: 'example success'
})
