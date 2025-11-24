import { Queue, QueueProps } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export const createSQSResource = (scope: Construct, queueName: string) => {
  
    const dlQueue = new Queue(scope, `sqs-queue-dl-${queueName} `, {
    queueName,        
  });

    const queueProp: QueueProps = {
        queueName,
        deadLetterQueue: {
            queue: dlQueue,
            maxReceiveCount: 5
        }
    };
  
    // SQS resource creation logic goes here
  const createdQueue = new Queue(scope, `sqs-queue-${queueName} `, queueProp);

  return createdQueue;
};
