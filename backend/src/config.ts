import Ajv from 'ajv'
import * as dotenv from 'dotenv'

import { StandardType as Type } from '@sinclair/typebox'

dotenv.config()

const validator = new Ajv.default()

const Schema = Type.Object({
    JWT_SECRET: Type.String(),
    INFLUXDB_URL: Type.String(),
    INFLUXDB_TOKEN: Type.String(),
})

if (!validator.compile(Schema)(process.env)) {
    throw new Error('Env schema error')
}

export const jwtSecret = process.env['JWT_SECRET']
export const influxDB = {
    url: process.env['INFLUXDB_URL'],
    token: process.env['INFLUXDB_TOKEN'],
}
