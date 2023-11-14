import {MetricSerializer} from '../MetricSerializer'
import {StandardUnit} from "@aws-sdk/client-cloudwatch/dist-types/models";
import {PutMetricDataCommandInput} from "@aws-sdk/client-cloudwatch";
import {mapTagsToDimensions} from "../utils/mapTagsToDimensions";

export class CloudWatchMetricSerializer implements MetricSerializer {
    build(
        metric: string,
        value: number,
        units: StandardUnit,
        tags: Record<string, string>,
        millisSinceEpoch: number,
        namespace: string,
    ): PutMetricDataCommandInput {
        if (namespace.trim() === '') {
            throw new Error('Namespace cannot be empty')
        }

        if (metric.trim() === '') {
            throw new Error('Metric name cannot be empty')
        }

        return {
            Namespace: namespace,
            MetricData: [
                {
                    MetricName: metric,
                    Dimensions: mapTagsToDimensions(tags),
                    Timestamp: new Date(millisSinceEpoch),
                    Value: value,
                    Unit: units
                }
            ]
        } as PutMetricDataCommandInput
    }
}
