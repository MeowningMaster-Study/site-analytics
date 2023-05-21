import { FastifySchema } from 'fastify'

import { StandardType as Type } from '@sinclair/typebox'

export const Post = {
    body: Type.Object({
        userId: Type.String(),
        sessionId: Type.String(),
        page: Type.String(),
    }),
} satisfies FastifySchema
