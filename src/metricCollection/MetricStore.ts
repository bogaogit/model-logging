import {GetMetricDataCommandInput, MetricDataResult, PutMetricDataCommandInput} from "@aws-sdk/client-cloudwatch";

export interface MetricStore {
    ingest(metrics: (string | PutMetricDataCommandInput)[]): Promise<void>

    getMetricData(getMetricDataCommandInput: string | GetMetricDataCommandInput): Promise<MetricDataResult[] | number[] | undefined>
}
