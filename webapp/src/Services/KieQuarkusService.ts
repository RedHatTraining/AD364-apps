import { RestService } from "./RestService";

export default class KieRestService extends RestService {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    public async fireRules(payload: string) {
        return await this.post<string, any>(
            `http://localhost:8090/integrate-review`,
            payload,
        );
    }
}
