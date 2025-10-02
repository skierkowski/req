import { parse } from 'yaml';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Function to check if config file exists
export const configFileExists = (configFilePath = 'req.yaml') => {
  const reqFilePath = path.isAbsolute(configFilePath)
    ? configFilePath
    : path.join(process.cwd(), configFilePath);

  return fs.existsSync(reqFilePath);
};

// Function to load and parse req.yaml file
export const loadReqFile = (configFilePath = 'req.yaml') => {
  const reqFilePath = path.isAbsolute(configFilePath)
    ? configFilePath
    : path.join(process.cwd(), configFilePath);

  try {
    const fileContent = fs.readFileSync(reqFilePath, 'utf8');
    const config = parse(fileContent);

    // Load .env file with default quiet:true option
    const defaultDotEnvOptions = { quiet: true };

    if (config.config && config.config.dotEnv) {
      const dotEnvOptions = {
        ...defaultDotEnvOptions,
        ...config.config.dotEnv,
      };

      // If path is relative, make it relative to process.cwd()
      if (dotEnvOptions.path && !path.isAbsolute(dotEnvOptions.path)) {
        dotEnvOptions.path = path.join(process.cwd(), dotEnvOptions.path);
      }

      dotenv.config(dotEnvOptions);
    } else {
      // Default behavior: load .env from current directory if it exists
      dotenv.config(defaultDotEnvOptions);
    }

    return config;
  } catch (error) {
    console.error(
      `Error loading config file '${reqFilePath}': ${error.message}`
    );
    process.exit(1);
  }
};

// Function to get stage variables from config
export const getStageVariables = (config, stageName = 'default') => {
  if (!config.stages) {
    return {};
  }

  const stage = config.stages[stageName];
  if (!stage) {
    return {};
  }

  return stage;
};
