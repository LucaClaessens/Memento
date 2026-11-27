# Transcription service

## Ownership

`createTranscriptionService` owns the path from an uploaded audio file to transcript
text: it converts the upload to the 16 kHz mono WAV the worker expects, hands that
path to the transcriber, and removes the temporary WAV. It owns no worker lifecycle
and no HTTP concerns.

## Invariants

- The transcriber receives a WAV path that exists only for the duration of the call.
- The temporary WAV is removed on success and on failure.
- No other module spawns `ffmpeg` or knows the conversion flags.
- The caller's upload file is never deleted here; the route owns it.

## Decisions

### Why a factory with an injected transcriber and converter

Tests need to prove the cleanup and error path without a model, a worker process or
`ffmpeg`. Passing `transcriber`, `convert`, `tempDir` and `newId` as arguments lets a
test hand over small fakes while the real module runs. The route receives the service,
so it maps errors without knowing where they came from.

### Why convert before queueing on the worker

The worker loads the model once and only accepts the 16 kHz mono WAV it was configured
for. Keeping conversion in the service means a bad upload fails before it reaches the
worker and the worker contract stays narrow.
