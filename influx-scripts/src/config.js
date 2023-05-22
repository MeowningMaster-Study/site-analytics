import * as dotenv from 'dotenv'
dotenv.config()

export const url = process.env['INFLUXDB_URL']
export const token = process.env['INFLUXDB_TOKEN']