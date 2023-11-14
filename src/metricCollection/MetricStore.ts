import {GetMetricDataCommandInput, MetricDataResult, PutMetricDataCommandInput} from "@aws-sdk/client-cloudwatch";

export interface MetricStore {
    ingest(metrics: (string | PutMetricDataCommandInput)[]): Promise<void>

    getMetricData(getMetricDataCommandInput: GetMetricDataCommandInput): Promise<MetricDataResult[] | number[] | undefined>
}
