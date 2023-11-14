import {MetricSerializer} from '../MetricSerializer'
import {Dimension, StandardUnit} from "@aws-sdk/client-cloudwatch/dist-types/models";
import {PutMetricDataCommandInput} from "@aws-sdk/client-cloudwatch";

export class CloudWatchMetricSerializer implements MetricSerializer {
    private mapTagsToDimensions(tags: Record<string, string> | undefined): Dimension[] {
        if (!tags) return []
        const dimensions: Dimension[] = []

        Object.entries(tags).forEach(([key, value]) => {
            dimensions.push({
                Name: key,
                Value: value,
            })
        })

        return dimensions
    }

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
                    Dimensions: this.mapTagsToDimensions(tags),
                    Timestamp: millisSinceEpoch,
                    Value: value,
                    Unit: units
                }
            ]
        } as PutMetricDataCommandInput
    }
}
