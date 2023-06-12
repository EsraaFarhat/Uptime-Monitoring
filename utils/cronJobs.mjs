import cron from "node-cron";

import { client } from "../database/connection.mjs";
import ChecksService from "../services/checks.service.mjs";

export const monitoringJobs = new Map();

export const startMonitoringCronJobs = async () => {
  try {
    // Get all the jobs from redis
    const keys = await client.keys("job:*");
    const checkIds = keys.map((key) => key.split(":")[1]);
    // Get all the checks that match these IDs
    const checks = await ChecksService.getChecks({ _id: { $in: checkIds } });
    // For each check start the cron job for monitoring
    checks.forEach((check) => {
      let job = cron.schedule(`*/${check.interval} * * * *`, async function () {
        await ChecksService.checkURL(check);
      });
      // Add the job to the monitoringJobs so we can stop it later
      monitoringJobs.set(JSON.stringify(check._id).replace(/"/g, ""), job);
    });
  } catch (error) {
    throw new error(error.message);
  }
};

// Run the function when the server is UP
(async function execute() {
  await startMonitoringCronJobs();
})();
