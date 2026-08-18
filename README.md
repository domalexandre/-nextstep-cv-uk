# NextStep CV UK

**Your experience. Your next opportunity.**

NextStep CV UK is a professional, ATS-friendly CV builder for the UK job market. It provides a guided CV editor, live A4 preview, six templates, AI-assisted writing, ATS analysis, cover letters and job tracking.

## Key features

- Guided CV builder with autosave and live preview
- Professional, Modern, Minimal, Executive, Graduate and Creative templates
- Direct selectable-text PDF downloads
- Editable Word/DOCX downloads
- Separate browser printing
- AI writing tools that improve wording without inventing facts
- Account dashboard backed by Supabase
- Mobile Edit/Preview workflow
- Privacy, terms, pricing and support pages

## Local development

Requirements: Node.js 20 or newer and npm.

```sh
npm install
cp .env.example .env
npm run dev
```

The local app is available at the URL printed by Vite.

## Environment variables

Copy `.env.example` to `.env` and provide the required values. Never commit `.env` or service-role/API keys. Client-side Supabase variables are public identifiers; privileged credentials must remain server-side.

## Quality checks

```sh
npm run lint
npm run build
```

## Export architecture

PDF generation uses `@react-pdf/renderer`, producing A4 documents with selectable text. Word generation uses `docx`, producing editable, ATS-friendly DOCX files. On supported mobile browsers, the file share sheet makes it easy to save to Files or send to another app; other browsers use a standard direct download.

## Technology

TanStack Start, React, TypeScript, Tailwind CSS, Supabase, React PDF and DOCX.
