import { FastifySchema } from 'fastify'

import { StandardType as Type } from '@sinclair/typebox'

export const Post = {
    body: Type.Object({
        token: Type.Optional(Type.String()),
        path: Type.String(),
        referrer: Type.Optional(Type.String()),
    }),
} satisfies FastifySchema
