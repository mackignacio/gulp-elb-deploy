import { optionBuilder, transformStream } from "./utils";
import { ElasticBeanstalkDeployOptions } from "./interface";
import EB from "./eb";
import S3 from "./s3";
import waiton from "./wait";
import deploy from "./deploy";
import zip from "gulp-zip";
import through from "through2";

const plexer = require("plexer");

/**
 * Gulp plugin for deploying environment into AWS elastic beanstalk.
 * @params options
 */
export = function (options: ElasticBeanstalkDeployOptions) {
  options = optionBuilder(options);
  const zipper = zip(options.filename);
  const streamPipe = zipper.pipe(through.obj(transformStream(options, S3, EB, deploy, waiton)));
  return plexer.obj(zipper, streamPipe);
};
