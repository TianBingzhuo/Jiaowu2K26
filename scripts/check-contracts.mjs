import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contractsRoot = join(root, 'app', 'contracts', 'v1');
const fixturePath = join(root, 'app', 'fixtures', 'v1', 'generated-object.bst.json');
const manifestPath = join(root, 'PROJECT-MANIFEST.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const schemas = readdirSync(contractsRoot)
  .filter((name) => name.endsWith('.schema.json'))
  .sort();

assert(schemas.length >= 4, 'Expected at least four versioned JSON Schemas.');
for (const schemaName of schemas) {
  const schema = readJson(join(contractsRoot, schemaName));
  assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', `${schemaName} must use JSON Schema 2020-12.`);
  assert(typeof schema.$id === 'string' && schema.$id.length > 0, `${schemaName} needs a stable $id.`);
}

const fixture = readJson(fixturePath);
assert(fixture.schema_version.startsWith('1.'), 'Golden fixture must use contract major version 1.');
assert(fixture.fixture === true, 'Golden fixture must remain explicitly labelled as fixture data.');
assert(fixture.generation_mode === 'fixture', 'Golden fixture must not impersonate model generation.');
assert(fixture.review_state === 'draft' && fixture.revision === 0, 'Golden fixture must begin at draft revision 0.');
assert(Array.isArray(fixture.source_ids) && fixture.source_ids.length > 0, 'Golden fixture needs source IDs.');
assert(Array.isArray(fixture.evidence) && fixture.evidence.length > 0, 'Golden fixture needs evidence.');
for (const item of fixture.evidence) {
  assert(fixture.source_ids.includes(item.source_fragment_id), `Evidence ${item.id} points outside source_ids.`);
}

const manifest = readJson(manifestPath);
assert(manifest.status?.phase === 'hacking', 'Manifest status must remain explicit during implementation.');

const openApi = readFileSync(join(contractsRoot, 'openapi.yaml'), 'utf8');
assert(openApi.startsWith('openapi: 3.1.0'), 'OpenAPI document must declare 3.1.0.');
assert(openApi.includes('/generated-objects/{object_id}/replay:'), 'OpenAPI document must expose the Phase 0 replay path.');

console.log(`Verified ${schemas.length} schemas, the golden fixture, OpenAPI, and project manifest.`);
