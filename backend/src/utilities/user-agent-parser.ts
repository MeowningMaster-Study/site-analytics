import UAParser from 'ua-parser-js'

import { OneOf } from './helper-types.js'

const deviceTypes = ['desktop', 'mobile', 'tablet'] as const
type DeviceType = OneOf<typeof deviceTypes>

export function parseUserAgent(userAgent: string) {
    const parser = new UAParser(userAgent)
    const device = parser.getDevice()
    const deviceType = normalizeDeviceType(device.type)
    const browser = parser.getBrowser()
    const os = parser.getOS()

    return {
        deviceType,
        browser,
        os,
    }
}

function normalizeDeviceType(type: string | undefined): DeviceType {
    switch (type) {
        case 'mobile':
        case 'tablet':
            return type
        default:
            return 'desktop'
    }
}
