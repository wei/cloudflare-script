import * as core from '@actions/core';
import * as vm from 'vm';

export class CloudflareRunner {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async execute(script: string): Promise<any> {
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
          log: (...args: any[]) => core.info(args.join(' ')),
          error: (...args: any[]) => core.error(args.join(' ')),
          warn: (...args: any[]) => core.warning(args.join(' ')),
          info: (...args: any[]) => core.info(args.join(' ')),
        },
        cloudflare,
        // Provide some useful utilities
        JSON,
        Promise,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        require: (moduleName: string) => {
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
    } catch (error) {
      core.error(`Script execution failed: ${error}`);
      throw error;
    }
  }

  private async importCloudflareSDK(): Promise<any> {
    try {
      // Dynamic import of the Cloudflare SDK
      const cloudflareModule = await import('cloudflare');
      return cloudflareModule.default || cloudflareModule;
    } catch (error) {
      core.error(`Failed to import Cloudflare SDK: ${error}`);
      throw new Error(`Failed to import Cloudflare SDK: ${error}`);
    }
  }
}