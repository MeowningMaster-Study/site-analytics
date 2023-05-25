import jwt from 'jsonwebtoken'

import { jwtSecret } from '#root/config.js'
import { logger } from '#root/logger.js'
import { getCountryByIp } from '#root/utilities/geo-lookup.js'
import { parseReferrer } from '#root/utilities/referrer-type.js'
import { parseUserAgent } from '#root/utilities/user-agent-parser.js'

import * as db from '../influxdb/connection.js'
import { Post } from './types.js'
import { FastifyPluginCallbackTypebox } from '@fastify/type-provider-typebox'
import { createId } from '@paralleldrive/cuid2'

type Auth = {
    user: string
    session: string
    /**
     * is new session
     */
    isNew: boolean
}

function normalizeAuth(token: string | undefined): Auth {
    if (token === undefined) {
        return { user: createId(), session: createId(), isNew: true }
    }
    try {
        const auth = jwt.verify(token, jwtSecret) as Auth
        auth.isNew = false
        return auth
    } catch (error) {
        if (typeof error !== 'object') {
            throw error
        }
        if (error instanceof jwt.TokenExpiredError) {
            const tokenContents = jwt.decode(token) as Auth
            return {
                user: tokenContents.user,
                session: createId(),
                isNew: true,
            }
        }
        throw error
    }
}

export const eventController: FastifyPluginCallbackTypebox = (
    server,
    options,
    done,
) => {
    server.post('/', { schema: Post }, (request, reply) => {
        const auth = normalizeAuth(request.body.token)

        db.writeView({
            ...auth,
            path: request.body.path,
        })

        if (auth.isNew) {
            const country = getCountryByIp(request.ip)
            const userAgent = parseUserAgent(
                request.headers['user-agent'] ?? '',
            )
            const referral = parseReferrer(request.body.referrer)

            db.writeSession({
                ...auth,
                deviceType: userAgent.deviceType,
                country: country ?? '',
                browserName: userAgent.browser.name ?? '',
                browserVersion: userAgent.browser.version ?? '',
                osName: userAgent.os.name ?? '',
                osVersion: userAgent.os.version ?? '',
                referralType: referral.type,
                referralDomain: referral.domain,
            })
        }

        const replyToken = jwt.sign(
            { user: auth.user, session: auth.session },
            jwtSecret,
            { expiresIn: '30m' },
        )
        reply.header('content-type', 'plain/text').send(replyToken)
    })

    server.post('/flush', async () => {
        await db.writeApi.flush()
        logger.debug('DB writer flushed')
    })

    done()
}
