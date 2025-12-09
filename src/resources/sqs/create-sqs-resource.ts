import { Queue, QueueProps } from "aws-cdk-lib/aws-sqs";
import { Stack } from "aws-cdk-lib/core";
import { Construct } from "constructs";

export const createSQSResource = (scope: Construct, queueName: string) => {
  const stackSuffix = Stack.of(scope).stackName;
  const physicalQueueName = `${queueName}-${stackSuffix}`;
  const physicalDlqName = `${queueName}-dead-letter-queue-${stackSuffix}`;

  const dlQueue = new Queue(scope, `sqs-queue-dl-${physicalQueueName}`, {
    queueName: physicalDlqName,
  });

    const queueProp: QueueProps = {
      queueName: physicalQueueName,
      deadLetterQueue: {
        queue: dlQueue,
        maxReceiveCount: 5,
      },
    };
  
    // SQS resource creation logic goes here
  const createdQueue = new Queue(scope, `sqs-queue-${physicalQueueName}`, queueProp);

  return createdQueue;
};
