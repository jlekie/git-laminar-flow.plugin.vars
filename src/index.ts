import * as Path from 'path';
import * as FS from 'fs-extra';
import * as Zod from 'zod';

import { PluginHandler } from '@jlekie/git-laminar-flow-cli';

const OptionsSchema = Zod.object({
    varsFilePath: Zod.string(),
});

const createPlugin: PluginHandler = (options) => {
    const parsedOptions = OptionsSchema.parse(options);

    return {
        init: async ({ config, stdout, dryRun }) => {
            const version = config.resolveVersion();

            if (!version)
                return;

            const versionRegex = new RegExp(`^VERSION=(.*)$`, 'gm');
            const varsFilePath = Path.resolve(config.path, parsedOptions.varsFilePath);

            await FS.ensureFile(varsFilePath);

            let content = await FS.readFile(varsFilePath, 'utf8');
            if (versionRegex.test(content))
                content = content.replace(versionRegex, `VERSION=${version}`);
            else
                content += `${!content.length || content.endsWith('\n') ? '' : '\n'}VERSION=${version}\n`;

            if (!dryRun) {
                await FS.writeFile(varsFilePath, content, 'utf8');
                stdout?.write(`Updated vars file written to ${varsFilePath}\n`);
            }
        },
        updateVersion: async (oldVersion, newVersion, { config, stdout, dryRun }) => {
            // const versionRegex = new RegExp(`VERSION=${oldVersion ?? '(.*)'}$`, 'gm');
            const versionRegex = new RegExp(`^VERSION=(.*)$`, 'gm');
            const varsFilePath = Path.resolve(config.path, parsedOptions.varsFilePath);

            await FS.ensureFile(varsFilePath);

            let content = await FS.readFile(varsFilePath, 'utf8');
            if (versionRegex.test(content))
                content = content.replace(versionRegex, `VERSION=${newVersion}`);
            else
                content += `${!content.length || content.endsWith('\n') ? '' : '\n'}VERSION=${newVersion}\n`;

            if (!dryRun) {
                await FS.writeFile(varsFilePath, content, 'utf8');
                stdout?.write(`Updated vars file written to ${varsFilePath}\n`);
            }
        }
    }
}

export default createPlugin;
