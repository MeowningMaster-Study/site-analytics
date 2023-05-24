import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { url, token } from './config.js';
import { createId } from '@paralleldrive/cuid2';
import { faker } from '@faker-js/faker';
import * as random from './random.js';
import { asMiliseconds, sitePaths } from './constants.js';

const org = 'org';
const bucket = 'data';

const influxDB = new InfluxDB({ url, token });

function generateRecords(startTimestamp, stopTimestamp) {
  const writeApi = influxDB.getWriteApi(org, bucket, 'ms');

  /**
   * @type {string[]}
   */
  const users = []
  function generateUserId() {
    const createNew = users.length === 0 || random.boolean(0.3)
    if (createNew) {
      const id = createId()
      users.push(id)
      return id
    }
    return random.arrayElement(users)
  }

  /**
   * @type {Map<string, string[]>}
   */
  const sessionsByUsers = new Map()

  function getSessionsByUser(userId) {
    let sessions = sessionsByUsers.get()
    if (sessions === undefined) {
      sessions = []
      sessionsByUsers.set(userId, sessions)
    }
    return sessions
  }

  function addSessionId(userId) {
    const sessions = getSessionsByUser(userId)
    const id = createId()
    sessions.push(id)
    return id
  }

  const countries = random.array(15, () => faker.location.country())
  const referrals = random.array(15, faker.internet.domainName)

  function generateSession() {
    const userId = generateUserId();
    const sessionId = addSessionId(userId);
    const deviceType = random.arrayElement(['desktop', 'mobile', 'tablet']);
    const country = random.arrayElement(countries);
    const browserName = random.arrayElement(['Chrome', 'Safari', 'Firefox', 'Vivaldi', 'Brave']);
    const browserVersion = random.int(90, 100, true);
    const osName = random.arrayElement(['Windows', 'Linux', 'Mac', 'IOS', 'Android']);
    const osVersion = random.int(6, 10, true);
    const referralType = random.arrayElement(['organic_search', 'direct', 'referral', 'social']);
    const referralDomain = random.arrayElement(referrals);
    const sessionTimestamp = random.int(startTimestamp, stopTimestamp);

    const sessionPoint = new Point('sessions')
      .tag('id', sessionId)
      .tag('user', userId)
      .tag('device_type', deviceType)
      .tag('country', country)
      .tag('browser_name', browserName)
      .tag('browser_version', browserVersion.toString())
      .tag('os_name', osName)
      .tag('os_version', osVersion.toString())
      .tag('referral_type', referralType)
      .tag('referral_domain', referralDomain)
      .intField('count', 1)
      .timestamp(sessionTimestamp)

    // console.log(point.toLineProtocol())
    writeApi.writePoint(sessionPoint)

    const isBounce = random.boolean(0.5)
    const viewsCount = isBounce ? 1 : random.int(1, 10, true)
    for (let i = 0; i < viewsCount; i++) {
      const path = random.arrayElement(sitePaths)
      const viewTimestamp = i == 0
        ? sessionTimestamp
        : random.int(sessionTimestamp, sessionTimestamp + asMiliseconds.minute * 30, true)

      const viewPoint = new Point('views')
        .tag('session', sessionId)
        .tag('user', userId)
        .tag('path', path)
        .intField('count', 1)
        .timestamp(viewTimestamp)

      writeApi.writePoint(viewPoint)
    }
  }

  function generateSessions() {
    for (let i = 0; i < 5000; i++) {
      generateSession()
    }
  }

  generateSessions();
  return writeApi.close();
}


const now = Date.now()
const monthAgo = now - asMiliseconds.day * 30
await generateRecords(monthAgo, now)
