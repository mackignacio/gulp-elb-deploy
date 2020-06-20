import { S3 as AWS_S3, AWSError } from "aws-sdk";
import { S3ConstructorOptions } from "./interface";
import * as vinyl from "vinyl";

/**
 * A simpler version of `AWS.S3` instance that focused on creating a model of a file in an S3 bucket.
 * Also provides a neat way of uploading files.
 */
export = class S3 {
  private instance: AWS_S3;
  bucket: string;
  key: string;

  /**
   * @constructor S3
   * @param  {String} bucket  Name of the bucket where elastic beanstalk is installed
   * @param  {String} key     Key of the file to be stored on the bucket
   *
   * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html AWS.S3}
   */
  constructor({ bucket, key }: S3ConstructorOptions) {
    this.bucket = bucket;
    this.key = key;
    this.instance = new AWS_S3({ params: { Bucket: bucket, Key: key } });
  }

  /**
   * Creates the current bucket on S3.
   *
   * @async
   * @return {Promise}  Resolved once the action has completed
   *
   * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createBucket-property AWS.S3#createBucket}
   */
  async create(): Promise<AWS_S3.CreateBucketOutput> {
    return await this.instance.createBucket().promise();
  }

  /**
   * Uploads a file to a s3 bucket.
   *
   * @async
   * @method S3#upload
   * @param  {external:vinyl.File} file - The file to upload
   * @return {Promise}  Resolved once the action has completed
   *
   * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property AWS.S3#upload}
   */
  upload(file: vinyl.StreamFile): Promise<AWS_S3.ManagedUpload.SendData> {
    return this.instance.upload({ Body: file.contents, Bucket: this.bucket, Key: this.key }).promise();
  }
};
