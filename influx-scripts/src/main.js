import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { url, token } from './config.js';
import { createId } from '@paralleldrive/cuid2';
import { faker } from '@faker-js/faker';

const org = 'org';
const bucket = 'data';

const influxDB = new InfluxDB({ url, token });

function randomBoolean(threshold = 0.5) {
  return Math.random() < threshold
}

function generateRecords(startDate, stopDate) {
  const startTimestamp = startDate.getTime()
  const stopTimestamp = stopDate.getTime()

  const writeApi = influxDB.getWriteApi(org, bucket, 'ms');

  /**
   * @type {string[]}
   */
  const users = []
  function generateUserId() {
    const createNew = users.length === 0 || randomBoolean(0.1)
    if (createNew) {
      const id = createId()
      users.push(id)
      return id
    }
    return faker.helpers.arrayElement(users)
  }

  /**
   * @type {Map<string, string[]>}
   */
  const sessionsByUsers = new Map()
  function generateSessionId(userId) {
    let sessions = sessionsByUsers.get()
    if (sessions === undefined) {
      sessions = []
      sessionsByUsers.set(userId, sessions)
    }
    const createNew = sessions.length === 0 || randomBoolean(0.5)
    if (createNew) {
      const id = createId()
      sessions.push(id)
      return id
    }
    return faker.helpers.arrayElement(sessions)
  }

  for (let i = 0; i < 2000; i++) {
    const userId = generateUserId();
    const sessionId = generateSessionId(userId);
    const deviceType = faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']);
    const country = faker.location.countryCode();
    const browserName = faker.helpers.arrayElement(['Chrome', 'Safari', 'Firefox', 'Vivaldi', 'Brave']);
    const browserVersion = faker.number.int({ min: 80, max: 100 });
    const osName = faker.helpers.arrayElement(['Windows', 'Linux', 'Mac', 'IOS', 'Android']);
    const osVersion = faker.number.int({ min: 6, max: 10 });
    const referralType = faker.helpers.arrayElement(['organic_search', 'direct', 'referral']);
    const referralDomain = faker.internet.domainName();
    const referralUri = faker.internet.url();
    const timestamp = Math.floor(Math.random() * (startTimestamp - stopTimestamp + 1)) + stopTimestamp;

    const point = new Point('sessions')
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
      .timestamp(timestamp)

    // console.log(point.toLineProtocol())
    writeApi.writePoint(point);
  }

  return writeApi.close();
}

await generateRecords(new Date("2023-05-01"), new Date("2023-05-31"))
