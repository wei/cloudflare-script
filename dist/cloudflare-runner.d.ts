export declare class CloudflareRunner {
    private apiToken;
    constructor(apiToken: string);
    execute(script: string): Promise<unknown>;
    private importCloudflareSDK;
}
