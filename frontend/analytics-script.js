const storageKey = 'analytics-token'

/**
 * Create backend client
 * @param {string} url
 * Send events automatically
 * @param {boolean} automatic
 */
export default function (url, automatic = true) {
    const client = {
        /**
         * @param {string=} path
         */
        async send(path) {
            const token = localStorage.getItem(storageKey)
            const reply = await fetch(new URL('/event', url), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token ?? undefined,
                    path: path ?? window.location.pathname,
                    referrer: document.referrer
                })
            })
            if (!reply.ok) {
                console.error('Event sending failed')
                return
            }
            const replyToken = await reply.text()
            localStorage.setItem(storageKey, replyToken)
            console.debug('Event is sent')
        }
    }

    if (automatic) {
        window.addEventListener('load', () => client.send())
    }

    return client
}