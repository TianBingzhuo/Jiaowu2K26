CREATE TABLE IF NOT EXISTS generated_objects (
    id TEXT PRIMARY KEY NOT NULL,
    revision INTEGER NOT NULL CHECK (revision >= 0),
    document_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_events (
    id TEXT PRIMARY KEY NOT NULL,
    object_id TEXT NOT NULL,
    sequence INTEGER NOT NULL CHECK (sequence > 0),
    document_json TEXT NOT NULL,
    FOREIGN KEY (object_id) REFERENCES generated_objects(id),
    UNIQUE (object_id, sequence)
);

CREATE TABLE IF NOT EXISTS published_versions (
    id TEXT PRIMARY KEY NOT NULL,
    object_id TEXT NOT NULL,
    version INTEGER NOT NULL CHECK (version > 0),
    document_json TEXT NOT NULL,
    FOREIGN KEY (object_id) REFERENCES generated_objects(id),
    UNIQUE (object_id, version)
);

CREATE INDEX IF NOT EXISTS idx_review_events_object_sequence
    ON review_events(object_id, sequence);

CREATE INDEX IF NOT EXISTS idx_published_versions_object_version
    ON published_versions(object_id, version);
