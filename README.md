# req - Configuration-Driven HTTP CLI Tool

A powerful command-line tool that dynamically creates commands based on YAML configuration files to make HTTP requests. Perfect for API testing, automation, and development workflows.

## ✨ Features

- 🚀 **Dynamic Commands**: Generate CLI commands from YAML configuration
- 🔧 **Multi-Stage Support**: Different configurations for dev, staging, prod, etc.
- 📝 **Variable Substitution**: Use Mustache templates with environment variables, stage variables, and CLI parameters
- 🎯 **JSONPath Extraction**: Extract specific values from API responses
- 📊 **Verbose Mode**: Detailed request/response debugging
- 🔐 **Environment Integration**: Seamlessly work with `.env` files

## 🚀 Installation

```bash
# Install globally
npm install -g @skierkowski/req

# Or use with npx (no installation required)
npx @skierkowski/req --help
```

## 📋 Quick Start

1. **Create a `req.yaml` configuration file:**

```yaml
# Example API calls
users:
  url: https://jsonplaceholder.typicode.com/users
  method: GET
  value: '$[0].name' # Extract first user's name

create-user:
  url: https://jsonplaceholder.typicode.com/users
  method: POST
  params:
    - name
    - email
  body:
    name: '{{name}}'
    email: '{{email}}'
    website: '{{name}}.dev'
  value: '$.id' # Extract the created user's ID

# Multi-stage configuration
stages:
  dev:
    base_url: https://api-dev.example.com
    api_key: dev-key-123
  prod:
    base_url: https://api.example.com
    api_key: prod-key-456

api-status:
  url: '{{base_url}}/status'
  headers:
    Authorization: 'Bearer {{api_key}}'
```

2. **Run your commands:**

```bash
# Basic usage
req users

# With parameters (using options)
req create-user --name "John Doe" --email "john@example.com"

# With parameters (using positional arguments)
req create-user "John Doe" "john@example.com"

# Mixed positional and options
req create-user "John Doe" --email "john@example.com"

# Using different stages
req api-status --stage prod

# Verbose mode for debugging
req users --verbose
```

## 📖 Usage

### Command Syntax

```bash
req [options] <command> [positional-args...] [command-options]
```

### Global Options

- `-c, --config <file>`: Config file path (default: `req.yaml`)
- `-v, --verbose`: Show detailed request/response information
- `-s, --stage <name>`: Stage to use for variables (default: `default`)
- `--help`: Show help information

### Positional Arguments vs Options

Parameters can be provided in two ways:

1. **As positional arguments** (in the order they're defined in `params`)
2. **As named options** using `--param-name value`
3. **Mixed** - combine both styles

When a parameter is provided as an option, it's excluded from positional argument mapping.

**Examples:**

```bash
# Given params: [name, email, role]

# All positional (in order)
req create-user "John Doe" "john@example.com" "admin"
# Result: name=John Doe, email=john@example.com, role=admin

# All options
req create-user --name "John Doe" --email "john@example.com" --role "admin"

# Mixed: option for email, positional for the rest
req create-user "John Doe" --email "john@example.com" "admin"
# Result: name=John Doe (1st positional), email=john@example.com (option), role=admin (2nd positional)

# Mixed: option for middle parameter
req create-user "John Doe" "admin" --email "john@example.com"
# Result: name=John Doe (1st positional), email=john@example.com (option), role=admin (2nd positional)
```

### Configuration File Structure

```yaml
# Global configuration (optional)
config:
  dotEnv:
    path: '.env.local' # Custom .env file path
    encoding: 'utf8' # File encoding (optional)
    override: false # Whether to override existing env vars (optional)

# Command definitions
command-name:
  url: 'https://api.example.com/endpoint'
  method: GET | POST | PUT | DELETE | PATCH # Default: GET
  headers:
    Content-Type: 'application/json'
    Authorization: 'Bearer {{token}}'
  body:
    key: '{{value}}'
  params: # CLI parameters this command accepts
    - param1
    - param2
  value: '$.path.to.extract' # JSONPath for response extraction

# Stage-specific variables
stages:
  stage-name:
    variable1: 'value1'
    variable2: 'value2'
```

## 🎯 Examples

### 1. Simple API Call

```yaml
# req.yaml
weather:
  url: "https://api.openweathermap.org/data/2.5/weather"
  params:
    - city
    - units
  url: "https://api.openweathermap.org/data/2.5/weather?q={{city}}&appid={{API_KEY}}&units={{units}}"
  value: "$.weather[0].description"
```

```bash
# Set API key in environment
export API_KEY=your-api-key

# Get weather
req weather --city "London" --units "metric"
# Output: "scattered clouds"
```

### 2. Multi-Stage API Testing

```yaml
# req.yaml
stages:
  dev:
    base_url: https://api-dev.company.com
    auth_token: dev-token-123
  staging:
    base_url: https://api-staging.company.com
    auth_token: staging-token-456
  prod:
    base_url: https://api.company.com
    auth_token: prod-token-789

health-check:
  url: '{{base_url}}/health'
  headers:
    Authorization: 'Bearer {{auth_token}}'
  value: '$.status'

create-resource:
  url: '{{base_url}}/resources'
  method: POST
  params:
    - name
    - type
  headers:
    Authorization: 'Bearer {{auth_token}}'
  body:
    name: '{{name}}'
    type: '{{type}}'
    timestamp: '{{timestamp}}'
  value: '$.id'
```

```bash
# Test different environments
req health-check --stage dev
req health-check --stage prod

# Create resources in different stages
req create-resource --stage dev --name "test-resource" --type "widget"
```

### 3. Complex API Workflow

```yaml
# req.yaml
stages:
  default:
    github_token: '{{GITHUB_TOKEN}}'
    repo_owner: 'octocat'
    repo_name: 'Hello-World'

list-issues:
  url: 'https://api.github.com/repos/{{repo_owner}}/{{repo_name}}/issues'
  headers:
    Authorization: 'token {{github_token}}'
    Accept: 'application/vnd.github.v3+json'
  value: '$[*].title'

create-issue:
  url: 'https://api.github.com/repos/{{repo_owner}}/{{repo_name}}/issues'
  method: POST
  params:
    - title
    - body
  headers:
    Authorization: 'token {{github_token}}'
    Accept: 'application/vnd.github.v3+json'
  body:
    title: '{{title}}'
    body: '{{body}}'
  value: '$.number'

get-issue:
  url: 'https://api.github.com/repos/{{repo_owner}}/{{repo_name}}/issues/{{issue_number}}'
  params:
    - issue_number
  headers:
    Authorization: 'token {{github_token}}'
  value: '$.state'
```

```bash
# Set GitHub token
export GITHUB_TOKEN=your-github-token

# List all issue titles
req list-issues

# Create a new issue
req create-issue --title "Bug Report" --body "Description of the bug"

# Check issue status
req get-issue --issue_number 42
```

## 🔧 Advanced Features

### Environment Variables and .env Files

By default, `req` automatically loads environment variables from a `.env` file in your current directory. You can customize this behavior using the `config.dotEnv` section in your `req.yaml` file:

```yaml
# req.yaml
config:
  dotEnv:
    path: '.env.production' # Load from a custom .env file
    encoding: 'utf8' # File encoding (default: utf8)
    override: false # Don't override existing env vars (default: false)

# Your commands here...
```

The `config.dotEnv` object is passed directly to [dotenv.config()](https://github.com/motdotla/dotenv#config), so you can use any options supported by dotenv:

- `path`: Path to the `.env` file (can be relative or absolute)
- `encoding`: File encoding (default: `utf8`)
- `override`: Override existing environment variables (default: `false`)
- `debug`: Enable debug mode to troubleshoot loading issues (default: `false`)

**Example with custom .env path:**

```yaml
# req.yaml
config:
  dotEnv:
    path: 'config/.env.staging'

stages:
  default:
    api_url: '{{API_URL}}' # Loaded from config/.env.staging
    api_key: '{{API_KEY}}'

api-request:
  url: '{{api_url}}/endpoint'
  headers:
    Authorization: 'Bearer {{api_key}}'
```

### Variable Precedence

Variables are resolved in the following order (highest to lowest priority):

1. **CLI Parameters**: `--param value`
2. **Stage Variables**: Defined in `stages` section
3. **Environment Variables**: From `.env` file or system environment

### JSONPath Extraction

Use JSONPath expressions to extract specific values from API responses:

```yaml
# Extract single value
value: "$.user.name"

# Extract from array
value: "$[0].id"

# Extract all items
value: "$[*].title"

# Complex path
value: "$.data.users[?(@.active)].email"
```

### Error Handling

The tool automatically:

- Exits with error code 1 on HTTP errors
- Shows detailed error messages in verbose mode
- Validates required configuration fields

### Custom Configuration Files

```bash
# Use custom config file
req --config api-config.yaml command-name

# Use different config for different projects
req --config ./configs/dev.yaml users --verbose
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/skierkowski/req/issues)
- 🐦 **Twitter**: [@skierkowski](https://twitter.com/skierkowski)

---

Made with ❤️ by [skierkowski](https://github.com/skierkowski)
