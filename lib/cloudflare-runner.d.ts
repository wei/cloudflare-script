export declare class CloudflareRunner {
    private apiToken;
    private version;
    constructor(apiToken: string, version: string);
    execute(script: string): Promise<any>;
    private importCloudflareSDK;
}
//# sourceMappingURL=cloudflare-runner.d.ts.map