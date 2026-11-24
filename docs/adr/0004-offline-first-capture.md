# Capture is offline-first; audio is queued on the phone and synced later

Capture happens on the go where Tailscale or the Mac Mini may be unreachable. The phone
records audio into local storage (IndexedDB) and a background sync uploads to the
backend when it becomes reachable, with retries. Raw entries are never lost because of
connectivity, and transcription never blocks capture (it runs on the backend after sync).

Consequences: the phone holds un-synced audio temporarily; sync state must be visible to
the user; uploads need idempotency keys.
