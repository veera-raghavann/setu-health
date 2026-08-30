# Security Policy

SETU is intended to handle highly sensitive health information. Security is a product requirement, not a release-stage add-on.

## Never commit

- API keys or access tokens
- Private keys/certificates
- Passwords or database credentials
- Real patient records or identifiable health data
- Production FHIR bundles
- Unredacted logs containing patient information

## Report a vulnerability

Do not open a public issue containing sensitive vulnerability details. Contact the repository maintainers privately through the project’s agreed secure channel.

## Security baseline

Production components should implement, as applicable:

- least-privilege access control
- RBAC and service-to-service authorization
- encryption in transit and at rest
- secret management outside source control
- short-lived clinical access sessions
- consent enforcement before external health-information access
- immutable/tamper-evident audit events
- input validation and upload scanning
- rate limiting and abuse protection
- prompt-injection and untrusted-document safeguards
- data minimisation and governed retention
- dependency and container vulnerability scanning
- security logging and incident response

Prototype/sandbox credentials and synthetic data must be clearly separated from production configuration.
