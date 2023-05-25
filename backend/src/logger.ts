import pino from 'pino'

export const logger = pino.default({
    level: 'debug',
    transport: {
        target: 'pino-pretty',
    },
})
