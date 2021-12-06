import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as directoryService from 'aws-cdk-lib/aws-directoryservice';
import { REMOTE_DESKTOP_CONFIG } from './remote-ec2.config';

export interface ExtStackProps extends StackProps {
  vpc: ec2.Vpc;
  alarmTopic: sns.Topic;
  //   ad: directoryService.CfnSimpleAD;
}
export class RdsStack extends Stack {
  constructor(scope: Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);
    // rds
    const prefix = REMOTE_DESKTOP_CONFIG.appName;
    const credentials = rds.Credentials.fromGeneratedSecret('postgres', {
      secretName: `${prefix}-credentials`,
    });
    const db = new rds.DatabaseInstance(this, 'DbInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13_4,
      }),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      credentials,
      storageEncrypted: true,
      allocatedStorage: 500,
      //   domain: props.ad.name,
      enablePerformanceInsights: true,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MEDIUM
      ),
    });

    // alarms
    const diskAlarm = new cw.Alarm(this, 'RdsDiskAlarm', {
      metric: db.metricFreeStorageSpace(),
      evaluationPeriods: 1,
      alarmDescription: 'Alarm for RDS Free Storage Space >400',
      threshold: 400,
    });
    diskAlarm.addOkAction(new cw_actions.SnsAction(props.alarmTopic));
    diskAlarm.addAlarmAction(new cw_actions.SnsAction(props.alarmTopic));
  }
}
