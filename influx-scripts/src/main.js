import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { url, token } from './config.js';
import { createId } from '@paralleldrive/cuid2';
import { faker } from '@faker-js/faker';
import * as random from './random.js';
import { asMiliseconds } from './constants.js';

const org = 'org';
const bucket = 'data';

const influxDB = new InfluxDB({ url, token });

function generateRecords(startDate, stopDate) {
  const startTimestamp = startDate.getTime()
  const stopTimestamp = stopDate.getTime()

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

  function generateSessionId(userId) {
    const sessions = getSessionsByUser(userId)
    return random.arrayElement(sessions)
  }

  const sitePaths = random.array(25, random.sitePath)

  function generateSession() {
    const userId = generateUserId();
    const sessionId = addSessionId(userId);
    const deviceType = random.arrayElement(['desktop', 'mobile', 'tablet']);
    const country = faker.location.countryCode();
    const browserName = random.arrayElement(['Chrome', 'Safari', 'Firefox', 'Vivaldi', 'Brave']);
    const browserVersion = random.int(90, 100, true);
    const osName = random.arrayElement(['Windows', 'Linux', 'Mac', 'IOS', 'Android']);
    const osVersion = random.int(6, 10, true);
    const referralType = random.arrayElement(['organic_search', 'direct', 'referral']);
    const referralDomain = faker.internet.domainName();
    const referralUri = faker.internet.url();
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
      .tag('referral_uri', referralUri)
      .intField('count', 1)
      .timestamp(sessionTimestamp)

    // console.log(point.toLineProtocol())
    writeApi.writePoint(sessionPoint)

    const isBounce = random.boolean(0.5)
    const viewsCount = isBounce ? 1 : random.int(1, 10)
    for (let i = 0; i < viewsCount; i++) {
      const path = random.arrayElement(sitePaths)
      const viewTimestamp = i == 0
        ? sessionTimestamp
        : random.int(sessionTimestamp, sessionTimestamp + asMiliseconds.minute * 30)

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
    for (let i = 0; i < 2000; i++) {
      generateSession()
    }
  }

  generateSessions();
  return writeApi.close();
}



await generateRecords(new Date("2023-05-01"), new Date("2023-05-31"))
