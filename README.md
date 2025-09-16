# cloudflare-script

GitHub Action for writing inline-scripts using Cloudflare TypeScript SDK

This action is modeled after `actions/github-script` and allows you to execute TypeScript code using the Cloudflare SDK directly in your GitHub Actions workflows.

## Inputs

### `script` (required)

The TypeScript script to execute. The script has access to a pre-configured `cloudflare` client instance.

## Environment Variables

### `CLOUDFLARE_API_TOKEN` (required)

Your Cloudflare API token for authentication. This should be stored as a repository secret.

## Outputs

### `result`

The result of the script execution, if the script returns a value.

## Usage

### Basic Example

```yaml
- name: Execute Cloudflare Script
  uses: wei/cloudflare-script@v5
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  with:
    script: |
      // List all zones
      const zones = await cloudflare.zones.list();
      console.log(`Found ${zones.result.length} zones`);

      // Return zone count for use in other steps
      return zones.result.length;
```

### Advanced Example

```yaml
- name: Update DNS Record
  uses: wei/cloudflare-script@v5
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  with:
    script: |
      // Find the zone
      const zones = await cloudflare.zones.list({
        name: 'example.com'
      });

      if (zones.result.length === 0) {
        throw new Error('Zone not found');
      }

      const zoneId = zones.result[0].id;

      // List DNS records
      const records = await cloudflare.dns.records.list({
        zone_id: zoneId,
        name: 'api.example.com',
        type: 'A'
      });

      if (records.result.length > 0) {
        // Update existing record
        const recordId = records.result[0].id;
        await cloudflare.dns.records.update(recordId, {
          zone_id: zoneId,
          type: 'A',
          name: 'api.example.com',
          content: '${{ steps.get-ip.outputs.ip }}'
        });
        console.log('DNS record updated');
      } else {
        // Create new record
        await cloudflare.dns.records.create({
          zone_id: zoneId,
          type: 'A',
          name: 'api.example.com',
          content: '${{ steps.get-ip.outputs.ip }}'
        });
        console.log('DNS record created');
      }
```

### Using with Outputs

```yaml
- name: Get Zone Info
  id: zone-info
  uses: wei/cloudflare-script@v5
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  with:
    script: |
      const zones = await cloudflare.zones.list();
      return {
        count: zones.result.length,
        names: zones.result.map(z => z.name)
      };

- name: Use Zone Info
  run: |
    echo "Zone count: ${{ fromJSON(steps.zone-info.outputs.result).count }}"
    echo "Zone names: ${{ join(fromJSON(steps.zone-info.outputs.result).names, ', ') }}"
```

## Available Objects

The script execution context includes:

- `cloudflare`: Pre-configured Cloudflare SDK client instance
- `console`: Console methods for logging (`log`, `error`, `warn`, `info`)
- Standard JavaScript objects: `JSON`, `Promise`, `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`

## Versioning & Releases

Automated release tooling keeps this action aligned with the latest Cloudflare TypeScript SDK:

- A daily scheduled workflow (also runnable manually) checks npm for new `cloudflare` releases. When a new version is available the workflow updates the dependency, rebuilds the bundled action, commits the changes, and publishes a GitHub release with matching tags.
- Each release is tagged with the Cloudflare SDK version (`v5.2.1`) and a moving major tag (`v5`) that always points to the latest release within that major series.
- Reference the action using a major tag such as `wei/cloudflare-script@v5` for automatic minor/patch updates, or pin to an exact release tag if you need a fixed SDK version.

Release notes document the Cloudflare SDK version change so you can see exactly what has been updated.

## Security

This action uses Node.js's built-in `vm` module to execute scripts in a controlled context. While this provides some isolation, be cautious about the scripts you execute and ensure your Cloudflare API token has only the necessary permissions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
