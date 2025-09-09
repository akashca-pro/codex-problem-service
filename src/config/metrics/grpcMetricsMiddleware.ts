import { grpcRequestCounter, grpcLatency } from "./metrics"; 

export const grpcMetricsCollector = (methodName: string, handler: Function) => {
  return async (call: any, callback: Function) => {
    const start = Date.now();
    const sampled = shouldSample();

    try {
        if(sampled) grpcRequestCounter.inc({ method: methodName, status: "OK" });
        await handler(call, callback); // invoke original handler

      if(sampled){
        const duration = Date.now() - start;
        grpcLatency.observe({ method: methodName, status: "OK" }, duration);
      }
    } catch (err) {
        const duration = Date.now() - start;
        grpcRequestCounter.inc({ method: methodName, status: "ERROR" });
        grpcLatency.observe({ method: methodName, status: "ERROR" }, duration);
        throw err;
    }
  };
};

function shouldSample(rate = 0.05): boolean {
  return Math.random() < rate;
}