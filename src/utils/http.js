import { JSONPath } from 'jsonpath-plus';

// Function to make HTTP requests using native fetch
export const makeRequest = async (url, options = {}, verbose = false) => {
  try {
    if (verbose) {
      console.log('\n--- REQUEST ---');
      console.log(`Method: ${options.method || 'GET'}`);
      console.log(`URL: ${url}`);
      if (options.headers) {
        console.log('Headers:', JSON.stringify(options.headers, null, 2));
      }
      if (options.body) {
        console.log('Body:', options.body);
      }
      console.log('');
    }

    const response = await fetch(url, options);

    if (verbose) {
      console.log('--- RESPONSE ---');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}`);
      console.error(`Response: ${errorText}`);
      process.exit(1);
    }

    const data = await response.json();

    if (verbose) {
      console.log('Body:', JSON.stringify(data, null, 2));
      console.log('');
    }

    return data;
  } catch (error) {
    console.error(`Network error: ${error.message}`);
    process.exit(1);
  }
};

// Function to extract values from JSON using JSONPath
export const getValueByPath = (obj, path) => {
  if (!path || path === '$') {
    return obj;
  }

  try {
    const results = JSONPath({ path, json: obj });

    // Return the first result if found, otherwise undefined
    return results.length > 0 ? results[0] : undefined;
  } catch (error) {
    console.error(`JSONPath error: ${error.message}`);
    return undefined;
  }
};
