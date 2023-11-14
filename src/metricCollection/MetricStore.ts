import {CloudWatchMetric, QueryCloudWatchMetric} from './cloudwatch/CloudWatchMetricStore'

export interface MetricStore {
  ingest(metrics: (string | CloudWatchMetric)[]): Promise<void>
  getMetricData(metricQueries: QueryCloudWatchMetric[]): Promise<number[] | undefined>
}
