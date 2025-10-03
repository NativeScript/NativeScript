# Contributing to NativeScript

:+1: First of all, thank you for taking the time to contribute! :+1:

We love your input! We want to make contributing to NativeScript as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Quick Links

- [Code of Conduct](#code-of-conduct)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Development Workflow](#development-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by the [NativeScript Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to <oss@nativescript.org>.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Set up your development environment** - see [Development Workflow](#development-workflow)
3. **Create a branch** for your changes
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Reporting Bugs

Before creating bug reports, please check existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected to see
- **Include screenshots or animated GIFs** if relevant
- **Include your environment details**: NativeScript version, OS, device/emulator info
- **If the problem is related to performance**, include a performance profile

### How to Submit a Bug Report

1. Go to the [Issues page](https://github.com/NativeScript/NativeScript/issues)
2. Click "New Issue"
3. Select the "Bug Report" template
4. Fill in all the required information
5. Submit the issue

## Requesting Features

Feature requests are welcome! Before submitting a feature request:

1. **Check if the feature has already been requested**
2. **Clearly describe the feature** and its use case
3. **Explain why this feature would be useful** to most NativeScript users
4. **Provide examples** of how the feature would be used

We prefer feature requests that:

- Describe a need rather than a specific technical solution
- Are applicable to a broad range of users
- Align with the NativeScript project goals

## Submitting Pull Requests

### Before You Submit

1. **Search for existing PRs** that might relate to your changes
2. **Discuss major changes** in an issue first to ensure your work aligns with project direction
3. **Sign the [CLA](http://www.nativescript.org/cla)** - required for all contributions
4. **Ensure there's an issue** describing the problem you're fixing

### Pull Request Process

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/NativeScript.git
   cd NativeScript
   git remote add upstream https://github.com/NativeScript/NativeScript.git
   ```

2. **Set up your development environment**

   ```bash
   npm run setup
   npm start  # View available commands
   ```

3. **Create a feature branch**

   ```bash
   git checkout -b fix/issue-description
   ```

4. **Make your changes**

   - Follow the [coding conventions](tools/notes/CodingConvention.md)
   - Write or update tests as needed
   - Update documentation if required
   - Follow the [error handling guide](tools/notes/HandlingErrors.md)

5. **Test your changes**

   - Run unit tests: `npm test`
   - Test on both iOS and Android if applicable
   - Ensure all tests pass before submitting

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "fix(component): brief description of fix"
   ```

   Follow our [commit message guidelines](#commit-message-guidelines)

7. **Push to your fork and submit a pull request**

   ```bash
   git push origin fix/issue-description
   ```

8. **Fill out the Pull Request template** completely

### Pull Request Requirements

- [ ] PR title follows our [commit message guidelines](#commit-message-guidelines)
- [ ] There is an issue describing the bug/feature
- [ ] You have signed the [CLA](http://www.nativescript.org/cla)
- [ ] All tests are passing
- [ ] Code follows our style guidelines
- [ ] Documentation is updated (if applicable)
- [ ] Commits are logically organized

## Development Workflow

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/NativeScript/NativeScript.git
cd NativeScript

# Install dependencies and set up workspace
npm run setup

# View all available commands
npm start
```

### Project Structure

```
NativeScript/
├── apps/              # Test and demo applications
├── packages/          # Core packages
│   ├── core/         # @nativescript/core package
│   ├── types/        # TypeScript definitions
│   ├── webpack5/     # Webpack configuration
│   └── ...
├── tools/            # Build tools and scripts
└── ...
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
nx test core

# Run tests with coverage
nx test core --coverage
```

### Building

```bash
# Build all packages
nx run-many --target=build --all

# Build a specific package
nx build core
```

## Commit Message Guidelines

We follow a strict commit message format to enable automatic changelog generation and make the commit history more readable.

### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

### Scope

The scope should be the name of the affected component (e.g., `core`, `android`, `ios`, `webpack`).

### Subject

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end
- Keep it concise (50 characters or less)

### Examples

```text
feat(core): add support for dark mode detection

fix(ios): resolve memory leak in ListView component

docs(readme): update installation instructions

perf(android): optimize image loading performance
```

### Breaking Changes

Breaking changes should be indicated in the footer:

```text
feat(core): change API signature for module loading

BREAKING CHANGE: 

The `loadModule` function now requires a second parameter
specifying the module type.

Migration:
- Before: loadModule('path/to/module')
- After: loadModule('path/to/module', 'js')
```

## Code Style

- We use Prettier for code formatting
- We use ESLint for code linting
- Run `npm run format` to format your code
- Run `npm run lint` to check for linting errors

## Documentation

- Update the README.md if you change functionality
- Update JSDoc comments for public APIs
- Add examples for new features
- Keep documentation clear and concise

## Community

- Join our [Discord](https://nativescript.org/discord)
- Follow us on [Twitter](https://twitter.com/NativeScript)
- Read our [blog](https://blog.nativescript.org)
- Check the [documentation](https://docs.nativescript.org)

## Questions?

- Check the [documentation](https://docs.nativescript.org)
- Search [existing issues](https://github.com/NativeScript/NativeScript/issues)
- Ask on [Discord](https://nativescript.org/discord)
- Post on [Stack Overflow](https://stackoverflow.com/questions/tagged/nativescript) with the `nativescript` tag

## License

By contributing to NativeScript, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Recognition

Contributors who make significant contributions will be recognized in:

- Release notes
- The project README
- Our [contributors page](https://github.com/NativeScript/NativeScript/graphs/contributors)

Thank you for contributing to NativeScript! 🎉
