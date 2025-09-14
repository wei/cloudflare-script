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
exports.CloudflareRunner = void 0;
const core = __importStar(require("@actions/core"));
const vm = __importStar(require("vm"));
class CloudflareRunner {
    constructor(apiToken, version) {
        this.apiToken = apiToken;
        this.version = version;
    }
    async execute(script) {
        try {
            // Import Cloudflare SDK dynamically
            const Cloudflare = await this.importCloudflareSDK();
            // Create Cloudflare client instance
            const cloudflare = new Cloudflare({
                apiToken: this.apiToken,
            });
            // Create a context for script execution
            const context = vm.createContext({
                console: {
                    log: (...args) => core.info(args.join(' ')),
                    error: (...args) => core.error(args.join(' ')),
                    warn: (...args) => core.warning(args.join(' ')),
                    info: (...args) => core.info(args.join(' ')),
                },
                cloudflare,
                // Provide some useful utilities
                JSON,
                Promise,
                setTimeout,
                clearTimeout,
                setInterval,
                clearInterval,
                require: (moduleName) => {
                    // Only allow specific safe modules
                    const allowedModules = ['util', 'path', 'querystring'];
                    if (allowedModules.includes(moduleName)) {
                        return require(moduleName);
                    }
                    throw new Error(`Module '${moduleName}' is not allowed`);
                }
            });
            // Wrap the script in an async function and return the result
            const wrappedScript = `
        (async () => {
          const result = await (async function() {
            ${script}
          })();
          return result;
        })()
      `;
            core.debug('Executing script in VM context');
            const result = await vm.runInContext(wrappedScript, context, {
                timeout: 60000, // 60 second timeout
                displayErrors: true
            });
            return result;
        }
        catch (error) {
            core.error(`Script execution failed: ${error}`);
            throw error;
        }
    }
    async importCloudflareSDK() {
        try {
            // Dynamic import of the Cloudflare SDK
            const cloudflareModule = await Promise.resolve().then(() => __importStar(require('cloudflare')));
            return cloudflareModule.default || cloudflareModule;
        }
        catch (error) {
            core.error(`Failed to import Cloudflare SDK: ${error}`);
            throw new Error(`Failed to import Cloudflare SDK version ${this.version}: ${error}`);
        }
    }
}
exports.CloudflareRunner = CloudflareRunner;
//# sourceMappingURL=cloudflare-runner.js.map