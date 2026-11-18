// Um único consumidor do TestsStream evita a multiplicação de listeners internos
// causada por três --test-reporter no Node 24. Nenhum aviso é suprimido.
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { spec, junit } from 'node:test/reporters';
import record from './node-reporter.mjs';
import common from './common.cjs';
export default async function* reporter(source) {
  const events = [];
  for await (const event of source) events.push(event);
  for await (const text of record(Readable.from(events))) yield text;
  let xml = '';
  for await (const text of junit(Readable.from(events))) xml += text;
  const folder = process.env.TEST_MODE === 'quarantine' ? process.env.TEST_REPORT_DIR : path.join(common.root, 'resultados');
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, 'unit-frontend.xml'), xml);
  yield* Readable.from(events).pipe(new spec());
}
