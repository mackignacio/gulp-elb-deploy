import { ElasticBeanstalk } from "aws-sdk";
import * as vinyl from "vinyl";
import through from "through2";
import EB from "./eb";
import S3 from "./s3";

export interface EnvironmentHealthStatus extends ElasticBeanstalk.DescribeEnvironmentHealthResult {
  Color?: "Green" | "Yellow" | "Red" | "Grey";
  HealthStatus?: string;
  Status?: string;
  ResponseMetadata?: string;
}

export interface ElasticBeanstalkOptions {
  region: string;
  application: string;
  environment: string;
}

export interface S3ConstructorOptions {
  bucket: string;
  key: string;
}

export type dateMethods = "getFullYear" | "getMonth" | "getDate" | "getHours" | "getMinutes" | "getSeconds";

export type DeployPromise = (
  options: ElasticBeanstalkDeployOptions,
  file: vinyl.StreamFile,
  s3file: S3,
  ebInstance: EB,
  waiton: Function
) => Promise<vinyl.StreamFile>;

export type TransformStream = (file: vinyl.StreamFile, enc: BufferEncoding, cb: through.TransformCallback) => void;

export interface ElasticBeanstalkDeployOptions {
  key: string;
  version: string;
  timestamp: boolean;
  waitForDeploy: boolean;
  versionLabel: string;
  filename: string;
  accessKeyId: string;
  secretAccessKey: string;
  signatureVersion: string;
  region: string;
  bucket: string;
  applicationName: string;
  environmentName: string;
}
