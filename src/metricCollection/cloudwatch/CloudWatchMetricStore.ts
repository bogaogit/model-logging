import {CloudWatch, GetMetricDataCommandInput, PutMetricDataCommandInput} from "@aws-sdk/client-cloudwatch";

import {MetricStore} from '../MetricStore'
import {Dimension, StandardUnit} from "@aws-sdk/client-cloudwatch/dist-types/models";
import {mapTagsToDimensions} from "../utils/mapTagsToDimensions";

export interface CloudWatchMetric {
    namespace: string | undefined
    metricName: string | undefined
    dimensions: Dimension[] | undefined
    unit: CloudWatchMetricUnit | undefined
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

export type CloudWatchMetricUnit = StandardUnit

export class CloudWatchMetricStore implements MetricStore {
    private cloudWatch: CloudWatch

    constructor(region: string) {
        //@ts-ignore
        this.cloudWatch = new CloudWatch({region})
    }

    async ingest(putMetricDataCommandInput: PutMetricDataCommandInput): Promise<void> {
        if (!metrics) return

        for (const metric of metrics) {
            const metricData: PutMetricDataCommandInput = {
                Namespace: metric.namespace,
                MetricData: [
                    {
                        MetricName: metric.metricName,
                        Dimensions: metric.dimensions,
                        Unit: metric.unit,
                        Value: metric.value,
                    },
                ],
            }

            // const metricData: PutMetricDataCommandInput = {
            //   Namespace: "MyApp/Metrics9", // Replace "MyApp/Metrics" with your desired metric namespace
            //   MetricData: [
            //     {
            //       MetricName: "MyCustomMetric", // Replace "MyCustomMetric" with your desired metric name
            //       Dimensions: [
            //         { Name: "Environment", Value: "Production" }, // Add any extra dimensions as required
            //       ],
            //       Unit: "Count",
            //       Value: 700, // Set your desired metric value here
            //     },
            //   ],
            // };

            // https://ap-southeast-2.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-2#metricsV2?graph=~(metrics~(~(~'MyApp*2fMetrics~'MyCustomMetric~'Environment~'Production))~sparkline~true~view~'timeSeries~stacked~false~region~'ap-southeast-2~start~'-PT3H~end~'P0D~stat~'Average~period~10)&query=~'*7bMyApp*2fMetrics*2cEnvironment*7d

            console.log(metricData);
            console.log("capture----------------------");

            try {
                const response = await this.cloudWatch.putMetricData(metricData);

                console.log(response);
                console.log("Metrics data sent successfully.");
            } catch (error) {
                console.error("Failed to send metrics data.", error);
            }

        }
    }

    // https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Statistics-definitions.html

    async getMetricData(metricQueries: QueryCloudWatchMetric[]): Promise<number[] | undefined> {
        if (!metricQueries) return undefined

        console.log(metricQueries);
        console.log("queries----------------------");

        const getMetricDataCommandInput: GetMetricDataCommandInput = {
            StartTime: query.startTime,
            EndTime: query.endTime,
            MetricDataQueries: [
                {
                    Id: query.id,
                    MetricStat: {
                        Metric: {
                            Namespace: query.namespace,
                            MetricName: query.metricName,
                            Dimensions: mapTagsToDimensions(query.tags),
                        },
                        Period: query.period,
                        Stat: query.stat,
                    },
                },
            ],
        }

        this.cloudWatch.getMetricData(getMetricDataCommandInput, (err, data) => {
            if (!err) {
                if (data?.MetricDataResults) {
                    console.log(data.MetricDataResults[0]);
                    console.log("Metrics data queried successfully.");

                    return data.MetricDataResults[0].Values
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
