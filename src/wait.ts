import log from "fancy-log";
import chalk from "chalk";
import EB from "./eb";
import { EnvironmentHealthStatus } from "./interface";

/**
 * Retuns a promise that is resolved after the specified time has passed
 * @param  {Number} time Time to wait
 * @return {Promise}
 */
function delay(time: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Returns a promise that will be resolved once the provided bean status report
 * changes to Ready.
 *
 * @param  {Bean}     eb - bean to be monitorized
 * @param  {Function} ebLog - handler for the status changes
 * @param  {Object}   envStatus - Previous EnvironmentHealthStatus
 * @return {Promise}  resolved once the status of the bean is Ready
 */
export = async function waiton(eb: EB, ebLog: Function, envStatus: EnvironmentHealthStatus = {}): Promise<EnvironmentHealthStatus | void> {
  await delay(2000);

  let status: EnvironmentHealthStatus;

  try {
    const { ResponseMetadata, InstancesHealth, RefreshedAt, ...retain } = (await eb.describeHealth()) as EnvironmentHealthStatus;
    status = retain;
  } catch (e) {
    if (e.message.includes("DescribeEnvironmentHealth is not supported")) {
      const msg = `Current EB environment doesn't support Enhanced health
            reporting. Instance is currently transitioning, but can"t wait for it
            to finish`;

      log(chalk.yellow(msg));
      return;
    }

    throw e;
  }

  if (envStatus && !(envStatus === status)) {
    ebLog(eb, envStatus, status);
  }

  if (status.Status !== "Ready") {
    return await waiton(eb, ebLog, status);
  }

  return status;
};
