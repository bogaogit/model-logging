import {CloudWatchMetric, QueryCloudWatchMetric} from './cloudwatch/CloudWatchMetricStore'

export interface MetricStore {
  ingest(metrics: (string | CloudWatchMetric)[]): Promise<void>
  queryLatestMetric(query: string | QueryCloudWatchMetric): Promise<number | undefined>
}
