import { optionBuilder, transformStream } from "./utils";
import { ElasticBeanstalkDeployOptions } from "./interface";
import { Duplex } from "stream";
import EB from "./eb";
import S3 from "./s3";
import waiton from "./wait";
import deploy from "./deploy";
import plexer from "./duplex";
import zip from "gulp-zip";
import through from "through2";

/**
 * Gulp plugin for deploying environment into AWS elastic beanstalk.
 * @params options
 */
export = function (options: ElasticBeanstalkDeployOptions): Duplex {
  options = optionBuilder(options);
  const zipper = zip(options.filename);
  const streamPipe = zipper.pipe(through.obj(transformStream(options, S3, EB, deploy, waiton)));
  return plexer.obj(zipper, streamPipe);
};
