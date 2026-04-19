# Changelog - PeerLift

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-19

### Highlights
- **Stabilized Chat Engine**: Resolved Pusher race conditions and stabilized AI messaging pipelines.
- **Lumina AI Tutor**: Integrated DeepSeek-R1 Distilled reasoning with interactive "Thinking Mode" visualizations.
- **DevOps Foundation**: Implemented Vitest unit testing suite and GitHub Actions CI/CD workflows.
- **Production Ready**: Full support for Vercel deployment and cloud database integration.

### Added
- Multi-modal support (PDF/DOCX/Image ingestion via OCR).
- Real-time Peer-to-Peer messaging via Pusher.
- Voice Mode with natural TTS and real-time speech recognition.
- Automatic Mermaid.js diagram rendering in chat.
- GitHub Actions workflow for automated builds and tests.
- Vitest testing environment with JSDOM and React mocks.

### Fixed
- Fixed "sendAIMessage is not a function" crash in AI SDK v6.
- Fixed triple-messaging bug by implementing Pusher cancellation tokens.
- Resolved type validation errors in Heartbeat and Contacts API.
- Fixed Markdown rendering failures and syntax errors in chat bubbles.

### Changed
- Refactored `getMessageText` logic to a shared high-performance utility.
- Optimized chat UI for mobile responsiveness and glassmorphism style.
- Updated environment configuration with `.env.example`.
