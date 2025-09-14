export declare class CloudflareRunner {
    private apiToken;
    constructor(apiToken: string);
    execute(script: string): Promise<any>;
    private importCloudflareSDK;
}
