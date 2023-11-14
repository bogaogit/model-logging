import {
  CloudWatch,
  CloudWatchClient, GetMetricDataCommandInput,
  ListMetricsCommand,
  PutMetricDataCommand,
  PutMetricDataCommandInput
} from "@aws-sdk/client-cloudwatch";

import { MetricStore } from '../MetricStore'
import {Dimension, StandardUnit} from "@aws-sdk/client-cloudwatch/dist-types/models";
import {mapTagsToDimensions} from "../utils/mapTagsToDimensions";
import {randomUUID} from "crypto";

export interface CloudWatchMetric {
  namespace: string | undefined
  metricName: string | undefined
  dimensions: Dimension[] | undefined
  unit: CloudWatchMetricUnit | undefined
  value: number | undefined
}

export interface QueryCloudWatchMetric {
  startTime: number | undefined
  endTime: number | undefined
  namespace: string | undefined
  metricName: string | undefined
  tags: Record<string, string>
  period: number | undefined
  stat: string | undefined
}

export type CloudWatchMetricUnit = StandardUnit

export class CloudWatchMetricStore implements MetricStore {
  private client: CloudWatchClient
  private cloudWatch: CloudWatch

  constructor(region: string) {
    //@ts-ignore
    this.client = new CloudWatchClient({ region })
    //@ts-ignore
    this.cloudWatch = new CloudWatch({ region })
  }

  async ingest(metrics: CloudWatchMetric[]): Promise<void> {
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
      const command = new PutMetricDataCommand(metricData);

      console.log(metricData);
      console.log("capture----------------------");

      try {
        const response = await this.client.send(command);


        console.log(response);
        console.log("Metrics data sent successfully.");
      } catch (error) {
        console.error("Failed to send metrics data.", error);
      }

    }
  }

  async queryLatestMetric(query: QueryCloudWatchMetric): Promise<number | undefined> {
    if (!query) return undefined

    console.log(query);
    console.log("query----------------------");

    const getMetricDataCommandInput: GetMetricDataCommandInput = {
      StartTime: new Date(Date.now() - 600000),
      EndTime: new Date(),
      MetricDataQueries: [
        {
          Id: "a",
          MetricStat: {
            Metric: {
              Namespace: query.namespace,
              MetricName: query.metricName,
              Dimensions: mapTagsToDimensions(query.tags),
            },
            Period: 600000,
            Stat: query.stat,
          },
        },
      ],
    }

    this.cloudWatch.getMetricData(getMetricDataCommandInput, (err, data) => {
      if (!err) {
        if (data?.MetricDataResults) {
          console.log(data.MetricDataResults);
          console.log("Metrics data queried successfully.");

          return data.MetricDataResults[0].Values?.slice(-1)[0]
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
