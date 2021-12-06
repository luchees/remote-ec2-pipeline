#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { NotificationsStack } from '../lib/notifications-stack';
import { CdkPipeline } from '../lib/cdkPipeline/cdk-pipeline';

const app = new cdk.App();

const env = {
  region: 'eu-west-1',
  account: '365201099929',
};

const notificationsStack = new NotificationsStack(app, 'NotificationStack', {
  description: 'stack for alarm topic',
  env,
});
const pipeline = new CdkPipeline(app, 'Ec2RemoteCdkPipeline', {
  alarmTopic: notificationsStack.alarmTopic,
  description: 'cdk pipeline stack for ec2 remote application',
  tags: {
    application: 'EC2-Remote-BI',
    environment: 'dev',
  },
  env,
});
