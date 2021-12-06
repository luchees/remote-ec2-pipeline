import * as ec2 from 'aws-cdk-lib/aws-ec2';
export const REMOTE_DESKTOP_CONFIG = {
  appName: 'Remote-EC2-BI',
  notificationEmail: 'lucasvandenabbeele@hotmail.com',
  domainName: 'devops.mediagenix.tv',
  ec2InstanceType: ec2.InstanceType.of(
    ec2.InstanceClass.R6G,
    ec2.InstanceSize.XLARGE
  ),
  codestarConnection:
    'arn:aws:codestar-connections:ap-southeast-1:365201099929:connection/40f6af9b-4a0e-4fa2-ad6f-662e4889139c',
};
