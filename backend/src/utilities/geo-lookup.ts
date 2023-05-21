import geoip from 'geoip-lite'

/**
 * @returns 2 letter ISO-3166-1 country code https://www.iban.com/country-codes
 */
export function getContryCodeByIp(ip: string): string | undefined {
    const record = geoip.lookup(ip)
    if (record === null) {
        return undefined
    }
    return record.country
}
