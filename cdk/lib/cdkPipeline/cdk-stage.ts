import { Stage, DefaultStackSynthesizer, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { REMOTE_DESKTOP_CONFIG } from '../remote-ec2.config';
import { RemoteEc2Stack } from '../remote-ec2-stack';
import { VpcStack } from '../vpc-stack';
import { NotificationsStack } from '../notifications-stack';
import { RdsStack } from '../rds-stack';
import { EC2BackupStack } from '../ec2-backup-stack';
import { AdStack } from '../ad-stack';

export interface ExtStageProps extends StageProps {
  tags?: { [key: string]: string };
  alarmTopic: sns.Topic;
}

export class RemoteEc2Stage extends Stage {
  constructor(scope: Construct, id: string, props: ExtStageProps) {
    super(scope, id, props);

    const vpcStack = new VpcStack(this, 'Ec2VpcStack');
    new EC2BackupStack(this, 'Ec2BackupStack', {
      alarmTopic: props.alarmTopic,
      tags: props.tags,
    });
    new RemoteEc2Stack(this, 'Ec2Stack', {
      vpc: vpcStack.vpc,
      tags: {
        ...props.tags,
        backup: '2HourlyMonthlyRetention',
      },
    });
    new RdsStack(this, 'Ec2RdsStack', {
      vpc: vpcStack.vpc,
      alarmTopic: props.alarmTopic,
      tags: {
        ...props.tags,
        backup: '2HourlyMonthlyRetention',
      },
    });
    // The AD stack wont work for sure
    // new AdStack(this, 'Ec2AdStack', {
    //   vpc: vpcStack.vpc,
    //   tags: props.tags,
    // });
  }
}
