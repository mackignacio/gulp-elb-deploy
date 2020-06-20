import { ElasticBeanstalk, AWSError } from "aws-sdk";
import { ElasticBeanstalkOptions } from "./interface";
import S3 from "./s3";

/**
 * A simpler version of `AWS.ElasticBeanstalk` instance that focused on deploying environments.
 * Also provides a neat way of updating environment.
 *
 */
export = class EB {
  private instance: ElasticBeanstalk;
  private application: string;
  environment: string;

  /**
   * @constructor EB
   * @param  {String} region      Elastic Beanstalk instance region identifier.
   * @param  {String} application Elastic Beanstalk Application name
   * @param  {String} environment Elastic Beanstalk Environment name
   *
   * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ElasticBeanstalk.html AWS.ElasticBeanstalk}
   */
  constructor({ region, application, environment }: ElasticBeanstalkOptions) {
    this.application = application;
    this.environment = environment;
    this.instance = new ElasticBeanstalk({ region });
  }

  /**
   * Creates a version name and a source code for the current elastic beanstalk application.
   *
   * @async
   * @param  {String} version Version label for the version to deploy
   * @param  {S3File} file    File containing the zipped source code of the version stored on S3
   * @return {Promise}        Resolved once the action has completed
   *
   * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ElasticBeanstalk.html#createVersion-property AWS.ElasticBeanstalk#createVersion}
   */
  async createVersion(version: string, file: S3): Promise<ElasticBeanstalk.ApplicationVersionDescriptionMessage> {
    return await this.instance
      .createApplicationVersion({
        ApplicationName: this.application,
        VersionLabel: version,
        SourceBundle: { S3Bucket: file.bucket, S3Key: file.key },
      })
      .promise();
  }

  /**
   * Updates the current environment to the version specified.
   *
   * @async
   * @param  {String} version Version name to deploy on the current elastic beanstalk environment
   * @return {Promise}        Resolved once the action has completed
   *
   * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ElasticBeanstalk.html#updateEnvironment-property AWS.ElasticBeanstalk#updateEnvironment}
   */
  async update(version: string): Promise<ElasticBeanstalk.EnvironmentDescription> {
    return await this.instance.updateEnvironment({ EnvironmentName: this.environment, VersionLabel: version }).promise();
  }

  /**
   * Describes the current status and health of the environment.
   *
   * @async
   * @method Bean#describeHealth
   * @return {Promise.<Object>} The environment status
   *
   * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ElasticBeanstalk.html#describeEnvironmentHealth-property AWS.ElasticBeanstalk#describeEnvironmentHealth}
   */
  async describeHealth(): Promise<ElasticBeanstalk.DescribeEnvironmentHealthResult> {
    return await this.instance.describeEnvironmentHealth({ EnvironmentName: this.environment, AttributeNames: ["All"] }).promise();
  }

  /**
   * Handle a function with an option and convert it to a promise.
   * @typeParam     `T` Type to be return of this function
   * @param request A function to be executed inside a promise
   * @param options Options that will be injected for the function provided
   * @returns       A Promise of type `T`
   */
  private promiseHandler<T>(request: Function, options: any): Promise<T> {
    return new Promise((resolve, reject) => {
      request(options, (error: AWSError, result: T) => {
        error ? reject(error) : resolve(result);
      });
    });
  }
};
