import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as as from 'aws-cdk-lib/aws-autoscaling';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { REMOTE_DESKTOP_CONFIG } from './remote-ec2.config';

export interface ExtStackProps extends StackProps {
  vpc: ec2.Vpc;
}

export class RemoteEc2Stack extends Stack {
  constructor(scope: Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);
    const prefix = REMOTE_DESKTOP_CONFIG.appName;
    const securityGroup = new ec2.SecurityGroup(
      this,
      'RemoteEc2SecurityGroup',
      {
        vpc: props.vpc,
        description: 'Allow RDP (3389)',
        allowAllOutbound: true,
      }
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3389),
      'Allow RDP Access'
    );
    const role = new iam.Role(this, 'RemoteEc2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );

    const ami = new ec2.WindowsImage(
      ec2.WindowsVersion.WINDOWS_SERVER_2019_ENGLISH_FULL_BASE
    );

    // scheduled termination after workhours

    const asg = new as.AutoScalingGroup(this, 'RemoteEc2ASG', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: REMOTE_DESKTOP_CONFIG.ec2InstanceType,
      blockDevices: [
        {
          deviceName: 'remote-ec2-volume',
          volume: as.BlockDeviceVolume.ebs(500, {
            deleteOnTermination: false,
            encrypted: true,
          }),
        },
      ],
      machineImage: ami,
      securityGroup: securityGroup,
      role: role,
      autoScalingGroupName: `${prefix}-asg`,
      desiredCapacity: 1,
      groupMetrics: [as.GroupMetrics.all()],
      instanceMonitoring: as.Monitoring.BASIC,
      //  notifications : [{topic: }],
      minCapacity: 0,
      maxCapacity: 1,
      associatePublicIpAddress: true,
    });

    asg.scaleOnSchedule('BootAsgWorkhourSchedule', {
      schedule: as.Schedule.cron({
        hour: '8',
        minute: '0',
        weekDay: 'MON-FRI',
      }),
      desiredCapacity: 1,
    });
    asg.scaleOnSchedule('terminateAsgWorkhourSchedule', {
      schedule: as.Schedule.cron({
        hour: '18',
        minute: '0',
        weekDay: 'MON-FRI',
      }),
      desiredCapacity: 0,
    });

    const lb = new elb.ApplicationLoadBalancer(this, 'RemoteEc2LB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup,
    });

    const hostedZone = new route53.HostedZone(this, 'RemoteEc2HostedZone', {
      zoneName: REMOTE_DESKTOP_CONFIG.domainName,
      comment: `hostedZone for ${REMOTE_DESKTOP_CONFIG.domainName}`,
    });

    const record = new route53.ARecord(this, 'RemoteEc2ARecord', {
      target: { aliasTarget: new targets.LoadBalancerTarget(lb) },
      zone: hostedZone,
      comment: 'record for loadbalancer',
    });
  }
}
