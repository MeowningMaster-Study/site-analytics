import fastify from 'fastify'

import { eventController } from './components/event/controller.js'
import { logger } from './logger.js'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import cors from '@fastify/cors'

const server = fastify.default({}).withTypeProvider<TypeBoxTypeProvider>()

server.register(cors.default)
server.register(eventController, { prefix: '/event' })

const port = 8080
await server.listen({ host: '0.0.0.0', port })
logger.info({ port }, 'Server listening')
