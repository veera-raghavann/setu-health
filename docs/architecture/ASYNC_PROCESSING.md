# PRISM Asynchronous Processing

## Why

OCR and later ASR are potentially slow. Patient-facing APIs must not hold an HTTP request open while processing multi-page medical records.

## Target flow

Upload → immutable resource → processing job → worker → evidence persistence → timeline update.

## Current implementation

A queue abstraction and worker loop now exist for development. Jobs have:

- queued
- processing
- completed
- failed
- retry count

## Production replacement

The interface is intentionally replaceable with Redis/BullMQ, RabbitMQ, SQS or another managed queue.

The public API should return:

`202 Accepted`

with a job identifier. Clients poll or receive a completion event.

## Failure rule

A failed OCR run must never partially mark evidence as clinician-confirmed. All machine output remains source_extracted.