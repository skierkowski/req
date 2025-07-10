#!/usr/bin/env node

import { Command } from 'commander';
import { loadReqFile } from './config/loader.js';
import { executeCommand } from './commands/handler.js';

const program = new Command();

// Function to get config file from command line arguments
const getConfigFile = () => {
  const args = process.argv;
  const configIndex = args.findIndex(
    (arg) => arg === '--config' || arg === '-c'
  );
  if (configIndex !== -1 && configIndex + 1 < args.length) {
    return args[configIndex + 1];
  }
  return 'req.yaml';
};

// Load configuration and create commands dynamically
const createCommands = (configFile) => {
  const config = loadReqFile(configFile);

  for (const [commandName, commandConfig] of Object.entries(config)) {
    // Skip the stages section when creating commands
    if (commandName === 'stages') {
      continue;
    }

    const command = program
      .command(commandName)
      .description(`Execute ${commandName} command`);

    // Add parameter options - support both new "params" array and old "param" string
    const parameters = [];

    if (commandConfig.params && Array.isArray(commandConfig.params)) {
      parameters.push(...commandConfig.params);
    } else if (commandConfig.param) {
      // Backward compatibility for old "param" syntax
      parameters.push(commandConfig.param);
    }

    parameters.forEach((param) => {
      command.option(`--${param} <value>`, `${param} parameter`);
    });

    // Add action handler
    command.action(async (options) => {
      const cliParams = {};

      // Collect all parameters
      parameters.forEach((param) => {
        if (options[param]) {
          cliParams[param] = options[param];
        }
      });

      // Get global options from parent command
      const parentOptions = command.parent.opts();

      await executeCommand(commandName, cliParams, {
        configFile: parentOptions.config || 'req.yaml',
        verbose: parentOptions.verbose || false,
        stage: parentOptions.stage || 'default',
      });
    });
  }
};

// Set up the CLI
program
  .name('req')
  .description('CLI tool for making HTTP requests based on YAML configuration')
  .version('1.0.0')
  .option('-c, --config <file>', 'config file path', 'req.yaml')
  .option(
    '-v, --verbose',
    'verbose mode - show request and response details',
    false
  )
  .option('-s, --stage <name>', 'stage to use for variables', 'default');

try {
  // Get config file from command line arguments
  const configFile = getConfigFile();

  createCommands(configFile);
  program.parse();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
