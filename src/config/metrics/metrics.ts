import client from 'prom-client';

client.collectDefaultMetrics();

export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of DB queries in ms',
  labelNames: ['operation', 'status'],
  buckets: [5, 20, 50, 100, 200, 500]
});

export const dbErrorCounter = new client.Counter({
  name: 'db_errors_total',
  help: 'Total number of DB errors',
  labelNames: ['operation']
});

export const register = client.register;