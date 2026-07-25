CREATE TABLE IF NOT EXISTS student_interactions (
    id TEXT PRIMARY KEY NOT NULL,
    object_id TEXT NOT NULL,
    published_version_id TEXT NOT NULL,
    occurred_at_unix_ms INTEGER NOT NULL CHECK (occurred_at_unix_ms >= 0),
    document_json TEXT NOT NULL,
    FOREIGN KEY (object_id) REFERENCES generated_objects(id),
    FOREIGN KEY (published_version_id) REFERENCES published_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_student_interactions_object_time
    ON student_interactions(object_id, occurred_at_unix_ms, id);
