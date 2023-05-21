import fastify from 'fastify'

import { eventController } from './components/event/controller.js'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

const server = fastify.default({}).withTypeProvider<TypeBoxTypeProvider>()

server.register(eventController)

const port = 8080
await server.listen({ host: '0.0.0.0', port })
console.log(`Server listening on port ${port}`)
