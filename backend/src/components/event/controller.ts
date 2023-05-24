import * as jwt from 'jsonwebtoken'

import { jwtSecret } from '#root/config.js'
import { getCountryByIp } from '#root/utilities/geo-lookup.js'
import { parseUserAgent } from '#root/utilities/user-agent-parser.js'

import { Post } from './types.js'
import { FastifyPluginCallbackTypebox } from '@fastify/type-provider-typebox'
import { createId } from '@paralleldrive/cuid2'

type Token = {
    user: string
    session: string
}

export const eventController: FastifyPluginCallbackTypebox = (
    server,
    options,
    done,
) => {
    server.post('/event', { schema: Post }, (request, reply) => {
        const { token } = request.body
        let user: string
        let session: string
        if (token === undefined) {
            user = createId()
            session = createId()
        } else {
            try {
                const tokenContents = jwt.verify(token, jwtSecret) as Token
                user = tokenContents.user
                session = tokenContents.session
            } catch (e) {
                if (typeof e !== 'object') {
                    throw e
                }
                if (e instanceof jwt.TokenExpiredError) {
                    session = createId()
                }
            }
        }

        const countryCode = getCountryByIp(request.ip)
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
