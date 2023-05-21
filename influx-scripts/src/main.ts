import "https://deno.land/std@0.188.0/dotenv/load.ts";

import {
  FluxTableMetaData,
  HttpError,
  InfluxDB,
  Point,
} from "npm:@influxdata/influxdb-client";
import { BucketsAPI, DeleteAPI } from "npm:@influxdata/influxdb-client-apis";
import { faker } from "npm:@faker-js/faker";
import { random } from "npm:lodash-es";

const db = new InfluxDB({
  url: Deno.env.get("INFLUXDB_URL"),
  token: Deno.env.get("INFLUXDB_TOKEN"),
});

// function deleteAll(selector: { org: string; bucket: string }) {
//   const deleteApi = new DeleteAPI(db);
//   const dateRange = {
//     start: new Date(1950, 0).toISOString(),
//     stop: new Date(2050, 0).toISOString(),
//   };
//   deleteApi.postDelete({ ...selector, body: dateRange });
// }

const writeApi = db.getWriteApi("org", "analytics");

// let timestamp = Date.now();
// for (let i = 0; i < 20; i += 1) {
//   const point = new Point("events")
//     .timestamp(timestamp)
//     .tag("page", faker.internet.url())
//     .stringField("browser", faker.internet.userAgent())
//     .stringField("os", faker.internet.userAgent())
//     .intField("score", random(100));
//   timestamp += 1000;
//   writeApi.writePoint(point);
// }

// try {
//   await writeApi.close();
//   console.log("FINISHED");
// } catch (e) {
//   console.error(e);
//   console.log("\nFinished ERROR");
// }

const queryApi = db.getQueryApi("org");
const fluxQuery =
  'from(bucket:"analytics") |> range(start: -1d) |> filter(fn: (r) => r._measurement == "temperature")';

// Execute query and receive table metadata and rows in a result observer.
function queryRows() {
  console.log("*** QueryRows ***");
  queryApi.queryRows(fluxQuery, {
    next: (row: string[], tableMeta: FluxTableMetaData) => {
      // the following line creates an object for each row
      const o = tableMeta.toObject(row);
      // console.log(JSON.stringify(o, null, 2))
      console.log(
        `${o._time} ${o._measurement} in '${o.location}' (${o.example}): ${o._field}=${o._value}`,
      );

      // alternatively, you can get only a specific column value without
      // the need to create an object for every row
      // console.log(tableMeta.get(row, '_time'))
    },
    error: (error: Error) => {
      console.error(error);
      console.log("\nQueryRows ERROR");
    },
    complete: () => {
      console.log("\nQueryRows SUCCESS");
    },
  });
}
queryRows();
