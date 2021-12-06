import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import { REMOTE_DESKTOP_CONFIG } from './remote-ec2.config';

export class NotificationsStack extends Stack {
  readonly alarmTopic: sns.Topic;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const prefix = REMOTE_DESKTOP_CONFIG.appName;
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      displayName: `${prefix}Alarm-Topic`,
      topicName: `${prefix}Alarm-Topic`,
    });
    alarmTopic.addSubscription(
      new subs.EmailSubscription(REMOTE_DESKTOP_CONFIG.notificationEmail)
    );
    this.alarmTopic = alarmTopic;
  }
}
