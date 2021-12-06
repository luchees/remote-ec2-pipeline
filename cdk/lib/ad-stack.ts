import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as directoryservice from 'aws-cdk-lib/aws-directoryservice';

export interface ExtStackProps extends StackProps {
  vpc: ec2.Vpc;
}
export class AdStack extends Stack {
  readonly ad: directoryservice.CfnSimpleAD;
  constructor(scope: Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);
    // ec2

    this.ad = new directoryservice.CfnSimpleAD(this, 'RemoteEc2SimpleAD', {
      name: 'bi.devops.mediagenix.tv',
      password: 'superSecret', // change in postdeploy!!!!!!
      size: 'Small',
      vpcSettings: {
        subnetIds: props.vpc.privateSubnets.map((subnet) => subnet.subnetId),
        vpcId: props.vpc.vpcId,
      },
      createAlias: false,
      description: 'Remote Ec2 instance Simple AD',
      enableSso: false,
    });
  }
}
