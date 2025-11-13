import { Metadata, ServiceError, CallOptions } from '@grpc/grpc-js';
import { config } from '@/config';

export type GrpcUnaryMethod <Req,Res> = (
    request : Req,
    metadata : Metadata,
    callOptions : CallOptions,
    callback : (error : ServiceError | null, response : Res) => void
) => void;


export class GrpcBaseService {
    
  protected grpcCall<Req, Res>(
    method: GrpcUnaryMethod<Req, Res>,
    request: Req,
    metadata: Metadata = new Metadata()
  ): Promise<Res> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + config.DEFAULT_GRPC_TIMEOUT!);
      const callOptions : CallOptions = {deadline};
      method(
        request,
        metadata,
        callOptions,
        (error: ServiceError | null, response: Res) => {
          if (error) {
            reject(error);
          }
          resolve(response);
        }
      );
    });
  }
}