import * as config from '../../config.js'
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client'

const org = 'org'
const bucket = 'data'

const influxDB = new InfluxDB(config.influxDB)
export const writeApi = influxDB.getWriteApi(org, bucket, 'ms')

async function gracefullShutdown() {
    try {
        await writeApi.close()
        process.exit(0)
    } catch (error) {
        process.exit(1)
    }
}
process.once('SIGINT', gracefullShutdown)
process.once('SIGTERM', gracefullShutdown)

export type SessionPoint = {
    session: string
    user: string
    deviceType: string
    country: string
    browserName: string
    browserVersion: string
    osName: string
    osVersion: string
    referralType: string
    referralDomain: string
}

export function writeSession(data: SessionPoint) {
    const point = new Point('sessions')
        .tag('id', data.session)
        .tag('user', data.user)
        .tag('device_type', data.deviceType)
        .tag('country', data.country)
        .tag('browser_name', data.browserName)
        .tag('browser_version', data.browserVersion)
        .tag('os_name', data.osName)
        .tag('os_version', data.osVersion)
        .tag('referral_type', data.referralType)
        .tag('referral_domain', data.referralDomain)
        .intField('count', 1)
    writeApi.writePoint(point)
}

export type ViewPoint = {
    session: string
    user: string
    path: string
}

export function writeView(data: ViewPoint) {
    const point = new Point('views')
        .tag('session', data.session)
        .tag('user', data.user)
        .tag('path', data.path)
        .intField('count', 1)
    writeApi.writePoint(point)
}
