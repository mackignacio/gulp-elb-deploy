import { EnvironmentHealthStatus, ElasticBeanstalkDeployOptions } from "./interface";
import * as vinyl from "vinyl";
import chalk from "chalk";
import log from "fancy-log";
import EB from "./eb";
import S3 from "./s3";

/**
 * Select a given function from the provide string that colorized a text.
 * `Default` grey.
 * @param color Name of the color `OPTIONAL`
 * @returns {chalk.Chalk} A function that colorized a text.
 */
function colorSelector(color?: "Green" | "Yellow" | "Red" | "Grey" | undefined): chalk.Chalk {
  if (!color) {
    return chalk.grey;
  }

  const colors = {
    Green: chalk.green,
    Yellow: chalk.yellow,
    Red: chalk.red,
    Grey: chalk.grey,
  };

  return colors[color];
}

/**
 * Logs a short summary of the status based from `AWS.ElasticBeanstalk` instance `EnvironmentHealthStatus`
 *
 * @param  {Bean}   ebInstance     An instance of `AWS.ElasticBeanstalk`
 * @param  {Object} previousStatus A previous `EnvironmentHealthStatus` value
 * @param  {Object} status         Current `EnvironmentHealthStatus` value
 * @return {String}                A message generated from the status of `AWS.ElasticBeanstalk`
 */
function ebLogger(ebInstance: EB, previousStatus: EnvironmentHealthStatus, status: EnvironmentHealthStatus): string {
  const previous: chalk.Chalk = colorSelector(previousStatus.Color);
  const current: chalk.Chalk = colorSelector(status.Color);

  const message = [
    `Enviroment ${chalk.cyan(ebInstance.environment)} transitioned`,
    `from ${previous(previousStatus.HealthStatus)}(${previous(previousStatus.Status)})`,
    `to ${current(status.HealthStatus)}(${current(status.Status)})`,
  ].join(" ");

  log(message);

  return message;
}

/**
 * Deploys a file to s3 where `AWS.ElasticBeanstalk` is pointing
 * provided from the options and creates a version name based on
 * the date and application name then updates the `AWS.ElasticBeanstalk` environment.
 *
 * @async
 * @param  {Object} options                ElasticBeanstalkDeployOptions
 * @param  {external:vinyl.File} file      The file to be deploy
 * @param  {S3File} s3file                 `AWS.S3` instance where to upload the file
 * @param  {Bean} eb                       `AWS.ElasticBeanstalk` where to deploy the environment
 * @return {Promise<external:vinyl.File>}   The original file provided
 */
export = async function (options: ElasticBeanstalkDeployOptions, file: vinyl.StreamFile, s3file: S3, eb: EB, waiton: Function): Promise<vinyl.StreamFile> {
  try {
    await s3file.upload(file);
  } catch (e) {
    if (e.code !== "NoSuchBucket") throw e;

    await s3file.create();
    await s3file.upload(file);
  }

  try {
    await eb.createVersion(options.versionLabel, s3file);
  } catch (error) {
    log("ERROR", error.message);
  }

  await eb.update(options.versionLabel);

  if (options.waitForDeploy) {
    await waiton(eb, ebLogger);
  }

  return file;
};
