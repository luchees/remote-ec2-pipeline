import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { REMOTE_DESKTOP_CONFIG } from '../remote-ec2.config';
import {
  DetailType,
  NotificationRule,
} from 'aws-cdk-lib/aws-codestarnotifications';
import { RemoteEc2Stage } from './cdk-stage';

export interface ExtStackProps extends StackProps {
  alarmTopic: sns.Topic;
}

export class CdkPipeline extends Stack {
  constructor(scope: Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);

    const prefix = REMOTE_DESKTOP_CONFIG.appName;

    const codePipeline = new pipelines.CodePipeline(this, 'RemoteEc2Pipeline', {
      pipelineName: `${prefix}-cdkpipeline`,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection(
          'luchees/remote-ec2-pipeline',
          'main',
          {
            connectionArn: REMOTE_DESKTOP_CONFIG.codestarConnection,
          }
        ),
        commands: [
          'cd cdk',
          'npm install',
          'npm run build',
          'npm run cdk -- synth',
        ],
        primaryOutputDirectory: 'cdk/cdk.out',
      }),
      // codeBuildDefaults: {
      //   rolePolicy: [
      //     new PolicyStatement({
      //       actions: ['ec2:Describe*'], // needed to get context information for cdk synth
      //       resources: ['*'],
      //     }),
      //   ],
      // },
    });

    const alarmTopic = sns.Topic.fromTopicArn(
      this,
      'PipelineAlarmTopic',
      `arn:aws:sns:${props.env?.region}:${props.env?.account}:${prefix}Alarm-Topic`
    );

    const stage = new RemoteEc2Stage(this, 'RemoteEc2Stage', {
      tags: props.tags,
      alarmTopic: props.alarmTopic,
    });

    codePipeline.addStage(stage);

    codePipeline.buildPipeline(); // step needed for the pipeline resource

    new NotificationRule(this, 'Notification', {
      detailType: DetailType.BASIC,
      events: ['codepipeline-pipeline-pipeline-execution-failed'],
      source: codePipeline.pipeline,
      targets: [props.alarmTopic],
      notificationRuleName: `${prefix}-awslimitchecker-pipeline-notification`,
    });
  }
}
