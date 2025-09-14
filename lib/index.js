"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const cloudflare_runner_1 = require("./cloudflare-runner");
async function run() {
    try {
        const script = core.getInput('script', { required: true });
        const version = core.getInput('version') || 'latest';
        // Check for required CLOUDFLARE_API_TOKEN environment variable
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;
        if (!apiToken) {
            throw new Error('CLOUDFLARE_API_TOKEN environment variable is required');
        }
        core.info(`Using Cloudflare SDK version: ${version}`);
        core.info('Executing Cloudflare script...');
        const runner = new cloudflare_runner_1.CloudflareRunner(apiToken, version);
        const result = await runner.execute(script);
        // Set outputs if the script returns a value
        if (result !== undefined) {
            core.setOutput('result', JSON.stringify(result));
        }
        core.info('Script executed successfully');
    }
    catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}
run();
//# sourceMappingURL=index.js.map