# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

Functional requirements

r6g.xlarge
Amazon EC2 R6g instances are powered by Arm-based AWS Graviton2 processors. They deliver up to 40% better price performance over current generation R5 instances for memory-intensive applications.
ec2 instance 4 CPU cores, 500 GB of storage and 32 GB of RAM

Microsoft Windows 2019 Datacenter edition installation

able to connect with RDP (Configuring the Remote Desktop setup is out of scope for this assignment)
Important thing to note is that the BI tool will connect to the database using the default port

RDS postgres 2 CPU cores, 4 GB of RAM, 500 GB of storage and needs tobe PostgreSQL compatible

Domain name for RDP bi.devops.mediagenix.tv. ( We can assume that we are able to manage the devops.mediagenix.tv)

CDK pipeline For deployment

Non Functional:

Running in AWS

Create Diagram and documentation
Keep cost as low as possible ( schedule down during weekends and after workin hours) ( DB AND EC2?)
The setup needs to comply with the current best practices related to security. TLS?

Active Directory -> bi.devops.mediagenix.tv. FQDN

If a machine becomes unhealthy it should be replaced automatically with a new instance. -> Healthcheck for windows??

Backups every 2H, with retention time 30 days. What will happen when EC2 is turned off?

Install cloudwatch agent and monitor usage ( users logged in ?) + RAM + Disk + CPU
