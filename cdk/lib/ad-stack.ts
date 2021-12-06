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
    // ad

    this.ad = new directoryservice.CfnSimpleAD(this, 'RemoteEc2SimpleAD', {
      name: 'bi.devops.mediagenix.tv',
      password: 'superSecret', // change in a postdeploy or similar script!!!!!!
      size: 'Small',
      vpcSettings: {
        subnetIds: props.vpc.publicSubnets.map((subnet) => subnet.subnetId), // Public???
        vpcId: props.vpc.vpcId,
      },
      createAlias: false,
      description: 'Remote Ec2 instance Simple AD',
      enableSso: false,
    });
  }
}
