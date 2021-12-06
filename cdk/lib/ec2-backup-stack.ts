import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as sns from 'aws-cdk-lib/aws-sns';
import { REMOTE_DESKTOP_CONFIG } from './remote-ec2.config';
import { Schedule } from 'aws-cdk-lib/aws-events';

export interface ExtStackProps extends StackProps {
  alarmTopic: sns.Topic;
}

export class EC2BackupStack extends Stack {
  constructor(scope: Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);
    const prefix = REMOTE_DESKTOP_CONFIG.appName;
    const vault = new backup.BackupVault(this, 'BackupVault', {
      removalPolicy: RemovalPolicy.RETAIN,
      backupVaultName: `${prefix}-Backup`,
      notificationTopic: props.alarmTopic,
      // only notify when backup fails
      notificationEvents: [
        backup.BackupVaultEvents.BACKUP_JOB_FAILED,
        backup.BackupVaultEvents.COPY_JOB_FAILED,
        backup.BackupVaultEvents.RESTORE_JOB_FAILED,
        backup.BackupVaultEvents.BACKUP_JOB_EXPIRED,
      ],
    });
    const rule = new backup.BackupPlanRule({
      backupVault: vault,
      completionWindow: Duration.hours(1),
      deleteAfter: Duration.days(30),
      scheduleExpression: Schedule.cron({
        hour: '2',
        minute: '0',
      }),
      startWindow: Duration.hours(2),
    });
    const plan = new backup.BackupPlan(this, 'TwoHourlyMonthlyRetentionPlan', {
      backupPlanRules: [rule],
      backupVault: vault,
    });

    new backup.BackupSelection(this, 'BackupSelectionSelection', {
      backupPlan: plan,
      resources: [
        backup.BackupResource.fromTag('backup', 'TwoHourlyMonthlyRetention'),
      ],
      allowRestores: true,
    });
  }
}
