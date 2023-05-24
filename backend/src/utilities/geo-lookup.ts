import geoip from 'geoip-lite'
import iso from 'iso-3166-1'

/**
 * @returns Country name
 */
export function getCountryByIp(ip: string): string | undefined {
    const record = geoip.lookup(ip)
    if (record === null) {
        return undefined
    }
    const countryCode = record.country
    return iso.whereAlpha2(countryCode)?.country
}
