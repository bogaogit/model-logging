import {
    CloudWatch,
    GetMetricDataCommandInput,
    MetricDataResult,
    PutMetricDataCommandInput
} from "@aws-sdk/client-cloudwatch";

import {MetricStore} from '../MetricStore'
import {Dimension, StandardUnit} from "@aws-sdk/client-cloudwatch/dist-types/models";

export interface CloudWatchMetric {
    namespace: string | undefined
    metricName: string | undefined
    dimensions: Dimension[] | undefined
    unit: StandardUnit | undefined
    value: number | undefined
}

export interface QueryCloudWatchMetric {
    id: string
    startTime: Date | undefined
    endTime: Date | undefined
    namespace: string | undefined
    metricName: string | undefined
    tags: Record<string, string>
    period: number | undefined
    stat: string | undefined
}

export class CloudWatchMetricStore implements MetricStore {
    private cloudWatch: CloudWatch

    constructor(region: string) {
        //@ts-ignore
        this.cloudWatch = new CloudWatch({region})
    }

    async ingest(putMetricDataCommandInput: PutMetricDataCommandInput): Promise<void> {
        if (!putMetricDataCommandInput) return

        console.log(putMetricDataCommandInput);
        console.log("capture----------------------");

        try {
            const response = await this.cloudWatch.putMetricData(putMetricDataCommandInput);

            console.log(response);
            console.log("Metrics data sent successfully.");
        } catch (error) {
            console.error("Failed to send metrics data.", error);
        }
    }

    // https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html

    async getMetricData(getMetricDataCommandInput: GetMetricDataCommandInput): Promise<MetricDataResult[] | undefined> {
        if (!getMetricDataCommandInput) return undefined

        console.log(getMetricDataCommandInput);
        console.log("getMetricDataCommandInput----------------------");

        this.cloudWatch.getMetricData(getMetricDataCommandInput, (err, data) => {
            if (!err) {
                if (data?.MetricDataResults) {
                    console.log(data.MetricDataResults);
                    console.log("Metrics data queried successfully.");

                    return data.MetricDataResults
                }
            } else {
                console.log("error-----------------")
                console.log(err)
            }
            return undefined
        })

        return undefined
    }
}
