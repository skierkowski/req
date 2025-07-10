import { loadReqFile, getStageVariables } from '../config/loader.js';
import { substituteVariables, mergeVariables } from '../utils/templating.js';
import { makeRequest, getValueByPath } from '../utils/http.js';

// Function to create and execute a command
export const executeCommand = async (commandName, cliParams, options = {}) => {
  const {
    configFile = 'req.yaml',
    verbose = false,
    stage = 'default',
  } = options;

  const config = loadReqFile(configFile);

  if (!config[commandName]) {
    console.error(`Command '${commandName}' not found in ${configFile}`);
    process.exit(1);
  }

  const commandConfig = config[commandName];

  // Validate required configuration
  if (!commandConfig.url) {
    console.error(`Command '${commandName}' is missing required 'url' field`);
    process.exit(1);
  }

  // Get stage variables
  const stageVariables = getStageVariables(config, stage);

  if (verbose && Object.keys(stageVariables).length > 0) {
    console.log(
      `Using stage '${stage}' variables:`,
      JSON.stringify(stageVariables, null, 2)
    );
  }

  // Merge CLI parameters with stage variables and environment variables
  const variables = mergeVariables(cliParams, stageVariables);

  // Substitute variables in the entire command configuration
  const resolvedConfig = substituteVariables(commandConfig, variables);

  // Prepare request options
  const requestOptions = {
    method: resolvedConfig.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...resolvedConfig.headers,
    },
  };

  // Add body if present
  if (resolvedConfig.body) {
    requestOptions.body = JSON.stringify(resolvedConfig.body);
  }

  // Make the HTTP request
  const responseData = await makeRequest(
    resolvedConfig.url,
    requestOptions,
    verbose
  );

  // Extract value using the configured path or return entire response if no path specified
  if (resolvedConfig.value) {
    const valuePath = resolvedConfig.value;
    const extractedValue = getValueByPath(responseData, valuePath);

    if (extractedValue !== undefined) {
      if (verbose) {
        console.log('--- EXTRACTED VALUE ---');
        console.log(`JSONPath: ${valuePath}`);
        console.log(`Value: ${extractedValue}`);
      } else {
        console.log(extractedValue);
      }
    } else {
      console.error(`No value found at path '${valuePath}' in response`);
      if (verbose) {
        console.error('Response data:', JSON.stringify(responseData, null, 2));
      }
      process.exit(1);
    }
  } else {
    // No value path specified, return entire response
    if (verbose) {
      console.log('--- FULL RESPONSE ---');
      console.log('No JSONPath specified, returning entire response');
    }
    console.log(JSON.stringify(responseData, null, 2));
  }
};
