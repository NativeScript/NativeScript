# Security Policy

## Supported Versions

We actively support the latest major version of NativeScript. Security updates are provided for:

| Version | Supported          |
| ------- | ------------------ |
| 9.x     | :white_check_mark: |
| 8.x     | :white_check_mark: |
| < 8.0   | :x:                |

## Reporting a Vulnerability

The NativeScript team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

**<oss@nativescript.org>**

Include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if available)
- Impact assessment and any potential security implications

### Response Timeline

- **Initial Response**: We will acknowledge receipt of your vulnerability report within 72 hours.
- **Status Updates**: We will send periodic updates about our progress addressing the issue.
- **Resolution**: We aim to resolve critical vulnerabilities within 90 days of disclosure.

### After Reporting

- We will confirm the vulnerability and determine its impact.
- We will develop and test a fix for the vulnerability.
- We will release the fix and publicly acknowledge your contribution (unless you prefer to remain anonymous).

## Security Best Practices

When using NativeScript in your applications:

1. **Keep Dependencies Updated**: Regularly update @nativescript/core and related packages to benefit from security patches.
2. **Review Third-Party Plugins**: Carefully audit any community plugins before integrating them into your project.
3. **Secure Data Storage**: Use appropriate encryption for sensitive data stored locally.
4. **Network Security**: Always use HTTPS for network communications containing sensitive information.
5. **Authentication**: Implement secure authentication mechanisms and never store credentials in plain text.

## Disclosure Policy

- We follow a coordinated disclosure policy.
- Security vulnerabilities will be disclosed publicly only after a fix is available.
- We credit security researchers who responsibly disclose vulnerabilities to us (with their permission).

## Security Updates

Security updates and advisories will be published:

- In the [GitHub Security Advisories](https://github.com/NativeScript/NativeScript/security/advisories) section
- In release notes with a `[SECURITY]` prefix
- On the [NativeScript blog](https://blog.nativescript.org)

## Bug Bounty Program

We currently do not have a paid bug bounty program. However, we deeply appreciate security researchers who help make NativeScript more secure and will publicly acknowledge their contributions.

## Contact

For any security-related questions or concerns:

- Email: <oss@nativescript.org>
- Discord: [NativeScript Community](https://nativescript.org/discord)

Thank you for helping keep NativeScript and our community safe!
