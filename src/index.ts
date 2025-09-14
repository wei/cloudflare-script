import * as core from '@actions/core';
import { CloudflareRunner } from './cloudflare-runner';

async function run(): Promise<void> {
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
    
    const runner = new CloudflareRunner(apiToken, version);
    const result = await runner.execute(script);
    
    // Set outputs if the script returns a value
    if (result !== undefined) {
      core.setOutput('result', JSON.stringify(result));
    }
    
    core.info('Script executed successfully');
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();