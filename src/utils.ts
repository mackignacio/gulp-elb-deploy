import { ElasticBeanstalkDeployOptions, dateMethods, DeployPromise, TransformStream } from "./interface";
import PluginError from "plugin-error";
import { readFileSync } from "fs";
import * as vinyl from "vinyl";
import through from "through2";
import EB from "./eb";
import S3 from "./s3";
import AWS from "aws-sdk";

/**
 * Add leading zero to a number and convert it to string
 * @param value {Number} Number to be padded
 */
export function pad(value: number): string {
  return `${value}`.padStart(2, "0");
}

/**
 * Returns current date formated as `YYYY.MM.DD_HH.mm.ss`
 * @return {String}
 */
export function dateToString(date = new Date()): string {
  const methods = ["getFullYear", "getMonth", "getDate", "getHours", "getMinutes", "getSeconds"];
  const arr = methods.map((method) => pad(date[method as dateMethods]())).join(".");
  return arr.slice(0, 10) + "_" + arr.slice(11);
}

/**
 * A function that act as a transform stream
 * @return {TransformStream} A function that is executed while a transform stream is occuring
 */
export function transformStream(
  options: ElasticBeanstalkDeployOptions,
  s3Ref: typeof S3,
  ebRef: typeof EB,
  deploy: DeployPromise,
  waiton: Function
): TransformStream {
  const { bucket, region, applicationName, environmentName, key } = options;
  const s3 = new s3Ref({ bucket, key });
  const eb = new ebRef({ region, application: applicationName, environment: environmentName });

  return (file: vinyl.StreamFile, enc: BufferEncoding, cb: through.TransformCallback) => {
    deploy(options, file, s3, eb, waiton)
      .then((result) => cb(null, result))
      .catch((e) => cb(e));
  };
}

/**
 * An object with the following contents will built and retunred:
 * If the resulting object amazon property contains accessKeyId and
 * secretAccessKey, both will be added as `AWS.config.credentials`.
 *
 * If the resulting object amazon property contains signatureVersion, it will
 * be added to `AWS.config`, ese v4 will be used as signatureVersion
 *
 * @param  {Object} options
 * @return {Object}
 * @throws {PluginError} if opts.amazon is not defined
 */
export function optionBuilder(options: ElasticBeanstalkDeployOptions): ElasticBeanstalkDeployOptions {
  let packageJSON;

  const PLUGIN_NAME = "gulp-ebdeploy";
  const { timestamp = true, waitForDeploy = true } = options;
  const opts = { ...options, timestamp, waitForDeploy };

  // If no name or no version provided, try to read it from package.json
  if (!opts.version) {
    const packageJsonStr = readFileSync("./package.json", "utf8");
    packageJSON = JSON.parse(packageJsonStr);
  }

  if (!opts.applicationName) {
    opts.applicationName = packageJSON.name;
  }

  if (!opts.version) {
    opts.version = packageJSON.version;
  }

  // Build the filename
  let versionLabel = opts.version;

  if (opts.timestamp !== false) {
    versionLabel += "-" + dateToString();
  }

  opts.versionLabel = versionLabel;
  opts.filename = versionLabel + ".zip";
  opts.key = opts.applicationName + opts.filename;

  if (!opts.accessKeyId) {
    throw new PluginError(PLUGIN_NAME, "AWS 'accessKeyId' is not provided");
  }

  if (!opts.secretAccessKey) {
    throw new PluginError(PLUGIN_NAME, "AWS 'secretAccessKey' is not provided");
  }

  AWS.config.credentials = new AWS.Credentials({
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
  });

  AWS.config.signatureVersion = opts.signatureVersion || "v4";

  return opts;
}
