import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import {aws_events as events, aws_events_targets as targets,aws_lambda as lambda, aws_lambda_nodejs} from "aws-cdk-lib"


export class SolfetchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fetchFunction = new aws_lambda_nodejs.NodejsFunction(this, 'FetchFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "lambda/fetch.ts", 
      functionName: "FetchFunction", 
    })
    
    const rule = new events.Rule(this, "Rule", {
      schedule: events.Schedule.cron({minute: "0"}), // Run every hour
    });

    rule.addTarget(new targets.LambdaFunction(fetchFunction))
  }
}
