# Persistence Status

## Durable when DATABASE_URL is configured

- Clinical evidence repository
- Patient resources repository
- Evidence timestamps and category indexing

## Development fallback

In-memory maps remain available only when PostgreSQL is not configured.

## Not yet durable

- Intake sessions
- Processing queue

These are the next infrastructure abstractions to replace with database/queue implementations.

## Production rule

A deployment claiming persistence must configure PostgreSQL and object storage. Memory fallback is not acceptable for production.