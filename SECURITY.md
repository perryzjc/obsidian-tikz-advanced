# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of TikZ Advanced Plugin seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. **Email the maintainer** at [perryzjc@gmail.com](mailto:perryzjc@gmail.com) with details about the vulnerability
3. Include the following information:
   - Type of vulnerability
   - Full path to the vulnerable file(s)
   - Steps to reproduce
   - Potential impact

## What to Expect

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a more detailed response within 7 days, indicating the next steps in handling your report
- We will keep you informed of our progress towards a fix and announcement
- We will notify you when the vulnerability has been fixed

## Security Considerations

The TikZ Advanced Plugin has the following security considerations:

1. **Server Component**: The plugin includes a server component that renders LaTeX code. This server should be run in a controlled environment.
2. **LaTeX Execution**: The server executes LaTeX commands, which could potentially be used for malicious purposes if not properly sandboxed.
3. **File System Access**: The server component requires access to the file system for temporary files.

## Best Practices

When using the TikZ Advanced Plugin, consider the following security best practices:

1. **Run the server locally** whenever possible
2. **Do not expose the server** to the public internet without proper authentication and security measures
3. **Keep the plugin and its dependencies updated** to the latest versions
4. **Review TikZ code** before rendering, especially if it comes from untrusted sources
