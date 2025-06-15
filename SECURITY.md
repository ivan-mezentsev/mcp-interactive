# Security Policy

## Supported Versions

We actively support the following versions of MCP Interactive with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of MCP Interactive seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

1. **GitHub Security Advisories**: Use GitHub's private vulnerability reporting feature by going to the [Security tab](https://github.com/ivan-mezentsev/mcp-interactive/security) of this repository.

2. **Email**: If you prefer email, you can create a GitHub issue with minimal details and request private communication.

### What to Include

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

We will acknowledge receipt of your vulnerability report within 48 hours and will send a more detailed response within 72 hours indicating the next steps in handling your report.

After the initial reply to your report, we will keep you informed of the progress towards a fix and full announcement, and may ask for additional information or guidance.

## Security Considerations

### Electron Security

This project uses Electron for the GUI interface. We follow Electron security best practices:

- Node integration is disabled in renderer processes where not needed
- Context isolation is enabled
- We regularly update Electron to the latest stable version

### MCP Protocol Security

When using MCP Interactive:

- The tool operates locally and does not transmit data to external servers
- User input is handled through secure Electron dialogs
- No sensitive data is logged or stored persistently

### Dependencies

We regularly audit our dependencies for known vulnerabilities and update them as needed.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any potential similar problems
3. Prepare fixes for all releases still under maintenance
4. Release new versions as soon as possible
5. Publicly disclose the issue after fixes are available

Thank you for helping keep MCP Interactive and our users safe!