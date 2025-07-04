import { parse } from 'yaml';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Function to load and parse req.yaml file
export const loadReqFile = (configFilePath = 'req.yaml') => {
  const reqFilePath = path.isAbsolute(configFilePath) 
    ? configFilePath 
    : path.join(process.cwd(), configFilePath);
  
  try {
    const fileContent = fs.readFileSync(reqFilePath, 'utf8');
    return parse(fileContent);
  } catch (error) {
    console.error(`Error loading config file '${reqFilePath}': ${error.message}`);
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