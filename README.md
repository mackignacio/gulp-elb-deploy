# gulp-elb-deploy

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Gulp plugin for deploying AWS Elastic Beanstalk applications

### Disclaimer

> _This is inspired by this other projects [gulp-beanstalk-deploy](https://github.com/a0ly/gulp-beanstalk-deploy) by SeungJae Lee and [gulp-elasticbeanstalk-deploy](https://github.com/Upplication/gulp-elasticbeanstalk-deploy) by Juan José Herrero Barbosa._

A plugin devloped in [Typescript](https://www.typescriptlang.org/) that helps you deploy your applications to `AWS Elastic Beanstalk` services easily using [Gulp](https://gulpjs.com/).

## Installation

You can install this plugin by running this command on the terminal

```shell
$ npm install gulp-elb-deploy
```

## Usage Example

```ts
import gulp from "gulp",
import  eb_deploy from "gulp-elb-deploy";

gulp.task("deploy", function () {
  return gulp
    .src(["<application-directory-path>"], {
      base: "./",
      nodir: true,
    })
    .pipe(
      eb_deploy({
        version: "APPLICATION_VERSION",
        timestamp: true,
        waitForDeploy: true,
        accessKeyId: "AWS_ACCESS_KEY",
        secretAccessKey: "AWS_SECRET_KEY",
        signatureVersion: "AWS_ENVIRONMENT_VERSION",
        region: "AWS_ENVIRONMENT_REGION",
        bucket: "AWS_ENVIRONMENT_S3_BUCKET",
        applicationName: "AWS_ELASTIC_BEANSTALK_APPLICATION_NAME",
        environmentName: "AWS_ELASTIC_BEANSTALK_ENVIRONMENT_NAME",
      })
    );
});
```

## Options

### version

- Type: `string`
- Default: `package.json version`

The version that will be used on the filename for the `.zip` file

### timestamp

- Type: `string`
- Default: `false`

Determine whether the filename will contain a `time and date`

### waitForDeploy

- Type: `string`
- Default: `false`

Determine whether to wait for the upload to finish

### accessKeyId

- Type: `string`
- Default: `~/.aws/credentials`

The `access key` provided by AWS associated with the IAM user or AWS account. [How do I create an AWS access key?](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/).

### secretAccessKey

- Type: `string`
- Default: `~/.aws/credentials`

The `secret key` provided by AWS associated with the IAM user or AWS account. [How do I create an AWS scret key?](https://aws.amazon.com/blogs/security/wheres-my-secret-access-key/).

### signatureVersion

- Type: `string`
- Default: `v4`

Version of AWS requests

### region

- Type: `string`
- Required

AWS application region. See [AWS service endpoints](https://docs.aws.amazon.com/general/latest/gr/rande.html).

### applicationName

- Type: `string`
- Required

The name of an AWS application associated with the IAM user or AWS account. See [AWS application name](https://docs.aws.amazon.com/cli/latest/reference/deploy/get-application.html)

### environmentName

- Type: `string`
- Required

The name of an AWS environment associated with your application. See [AWS CreateEnvironment](https://docs.aws.amazon.com/elasticbeanstalk/latest/api/API_CreateEnvironment.html)

### bucket

- Type: `string`
- Required

The name of an AWS S3 bucket associated with your Elastic Beanstalk. See [Elastic Beanstalk with Amazon S3](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/AWSHowTo.S3.html)

## License

MIT

## Contributor

### [Mark Anthony Ignacio](https://github.com/Mackignacio)

[npm-image]: https://img.shields.io/npm/v/gulp-elb-deploy.svg
[npm-url]: https://npmjs.org/package/gulp-elb-deploy
[travis-image]: https://img.shields.io/travis/Upplication/gulp-elasticbeanstalk-deploy/master.svg
[travis-url]: https://travis-ci.org/Upplication/gulp-elasticbeanstalk-deploy
[coveralls-image]: https://img.shields.io/coveralls/Upplication/gulp-elasticbeanstalk-deploy/master.svg
[coveralls-url]: https://coveralls.io/r/Upplication/gulp-elasticbeanstalk-deploy?branch=master
