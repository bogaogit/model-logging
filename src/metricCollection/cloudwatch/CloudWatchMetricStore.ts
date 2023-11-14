import {
    CloudWatch,
    GetMetricDataCommandInput,
    MetricDataResult,
    PutMetricDataCommandInput
} from "@aws-sdk/client-cloudwatch";

import {MetricStore} from '../MetricStore'

export class CloudWatchMetricStore implements MetricStore {
    private cloudWatch: CloudWatch

    constructor(region: string) {
        //@ts-ignore
        this.cloudWatch = new CloudWatch({region})
    }

    groupBy(putMetricDataCommandInputs: PutMetricDataCommandInput[], groupByKey: string): {[key: string]: PutMetricDataCommandInput[]} {
        return putMetricDataCommandInputs.reduce(function(rv, x) {
            (rv[x[groupByKey]] = rv[x[groupByKey]] || []).push(x);
            return rv;
        }, {});
    };

    async ingest(putMetricDataCommandInputs: PutMetricDataCommandInput[]): Promise<void> {
        if (!putMetricDataCommandInputs) return

        console.log(putMetricDataCommandInputs);
        console.log("capture----------------------");

        const metricGroups = this.groupBy(putMetricDataCommandInputs, 'Namespace')

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
