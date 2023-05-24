import * as referrerDomains from '../constants/referrer-domains.js'
import type { OneOf } from './helper-types.js'

const referrerTypes = [
    'direct',
    'organic_search',
    'social',
    'referral',
] as const
type ReferrerType = OneOf<typeof referrerTypes>

type Referref = {
    domain: string
    type: ReferrerType
}

export function parseReferrer(referrer: string | undefined): Referref {
    if (referrer === undefined || referrer === '') {
        return { type: 'direct', domain: '' }
    }
    const url = new URL(referrer)
    const domain = url.hostname
    if (referrerDomains.organicSearch.includes(domain)) {
        return { type: 'organic_search', domain }
    }
    if (referrerDomains.social.includes(domain)) {
        return { type: 'social', domain }
    }
    return { type: 'referral', domain }
}
