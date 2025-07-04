import Mustache from 'mustache';

// Function to substitute template variables using Mustache
export const substituteVariables = (obj, variables) => {
  if (typeof obj === 'string') {
    // Disable HTML escaping by providing a custom escape function that returns the value unchanged
    return Mustache.render(obj, variables, {}, { escape: (value) => value });
  } else if (Array.isArray(obj)) {
    return obj.map(item => substituteVariables(item, variables));
  } else if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteVariables(value, variables);
    }
    return result;
  }
  return obj;
};

// Function to merge CLI parameters with environment variables and stage variables
export const mergeVariables = (cliParams, stageVariables = {}) => {
  // Start with environment variables
  const variables = { ...process.env };
  
  // Add stage variables (they take precedence over env vars)
  Object.assign(variables, stageVariables);
  
  // Add CLI parameters (they take precedence over stage vars and env vars)
  Object.assign(variables, cliParams);
  
  return variables;
}; 