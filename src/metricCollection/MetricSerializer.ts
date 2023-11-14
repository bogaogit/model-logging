import {PutMetricDataCommandInput} from "@aws-sdk/client-cloudwatch";

export interface MetricSerializer {
  build(
    metric: string,
    value: number,
    units: string,
    tags: Record<string, string>,
    millisSinceEpoch: number,
    namespace: string | undefined,
  ): string | PutMetricDataCommandInput
}
