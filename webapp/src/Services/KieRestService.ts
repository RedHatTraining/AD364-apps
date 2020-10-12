import { RestService } from "./RestService";

export default class KieRestService extends RestService {
    constructor(baseUrl: string, readonly containerName: string) {
        super(baseUrl);
    }

    public async fireRules(payload: string) {
        return await this.post<string, any>(
            `http://localhost:8080/kie-server/services/rest/server/containers/instances/${this.containerName}`,
            payload,
        );
    }
}
