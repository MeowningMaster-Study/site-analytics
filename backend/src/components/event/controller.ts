import { FastifyPluginCallback } from 'fastify'

import { getContryCodeByIp } from '#root/utilities/geo-lookup.js'
import { parseUserAgent } from '#root/utilities/user-agent-parser.js'

import { Post } from './types.js'

export const eventController: FastifyPluginCallback = (
    server,
    options,
    done,
) => {
    server.post('/event', { schema: Post }, (request, reply) => {
        const countryCode = getContryCodeByIp(request.ip)
        const userAgent = parseUserAgent(request.headers['user-agent'] ?? '')
        reply.header('content-type', 'application/json')
        return reply.send({
            body: request.body,
            countryCode,
            userAgent,
        })
    })
    done()
}
