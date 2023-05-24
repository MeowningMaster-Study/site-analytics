import Ajv from 'ajv'
import * as dotenv from 'dotenv'

import { StandardType as Type } from '@sinclair/typebox'

dotenv.config()

const validator = new Ajv.default()

const Schema = Type.Object({
    JWT_SECRET: Type.String(),
})

if (!validator.compile(Schema)(process.env)) {
    throw new Error('Env schema error')
}

export const jwtSecret = process.env['JWT_SECRET']
