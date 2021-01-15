import { RestService } from "./RestService";

export default class KieDMNService extends RestService {
    constructor(readonly containerName: string) {
        super();
    }

    public async fireDMN(payload: string) {
        const dmnInfo: any = await this.get(
            `http://localhost:8080/kie-server/services/rest/server/containers/${this.containerName}/dmn`,
        );
        const dmnNamespace = dmnInfo.result["dmn-model-info-list"]["models"][0]["model-namespace"];
        console.log("Parsed the following namespace:", dmnNamespace);
        const dmnPayload = `{ "model-namespace": "${dmnNamespace}", ${payload} }`;
        console.log("Using the following payload:", dmnPayload);
        return this.post<string, any>(
            `http://localhost:8080/kie-server/services/rest/server/containers/${this.containerName}/dmn`,
            dmnPayload,
        );
    }
}
