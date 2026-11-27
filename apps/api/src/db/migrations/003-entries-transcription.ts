import type { Db } from "../types.js";

export const migration = {
  id: "003-entries-transcription",
  up(db: Db): void {
    db.exec(`
      ALTER TABLE entries ADD COLUMN audio_path TEXT;
      ALTER TABLE entries ADD COLUMN transcription_status TEXT NOT NULL DEFAULT 'done'
        CHECK (transcription_status IN ('pending', 'done', 'failed'));
    `);
  },
};
