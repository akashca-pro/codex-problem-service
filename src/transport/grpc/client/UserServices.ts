import { AuthUserServiceClient,  UpdateUserProgressRequest, } from "@akashcapro/codex-shared-utils";
import { GrpcBaseService } from "./GrpcBaseService";
import { config } from "@/config";
import { credentials } from "@grpc/grpc-js";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import fs from "fs";

const caCert = fs.readFileSync("/secrets/ca/ca.pem");
const clientKey = fs.readFileSync("/secrets/key/problem.key");
const clientCert = fs.readFileSync("/secrets/cert/problem.pem");

/**
 * Class implementing the user grpc client call.
 * 
 * @class
 * @extends {GrpcBaseService}
 */
export class GrpcUserService extends GrpcBaseService {

    #_client : AuthUserServiceClient

    constructor(){
        super();
        this.#_client = new AuthUserServiceClient(
            config.GRPC_AUTH_USER_SERVICE_URL!,
            credentials.createSsl(caCert, clientKey, clientCert)
        );
    }

    updateUserProgress = async(
        request : UpdateUserProgressRequest
    ) : Promise<Empty> => {
        return this.grpcCall(this.#_client.updateUserProgress.bind(this.#_client), request)
    }

}

export default new GrpcUserService();