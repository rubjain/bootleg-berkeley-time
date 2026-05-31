# Official Requirements Ingestion Strategy

## Goal

Ingest official major and minor requirements from university-owned sources, normalize them into structured database records, and preserve source traceability plus review state.

## Pipeline

1. Source registry
2. Fetch official page snapshot
3. Parse with a school/source-specific importer
4. Normalize into canonical requirement records
5. Review uncertain rows
6. Publish a new active requirement set version

## Confidence model

- `HIGH`: parser matched explicit course codes and requirement group labels reliably
- `MEDIUM`: parser captured structure but some interpretation was inferred
- `LOW`: parser produced partial structure and needs manual review
