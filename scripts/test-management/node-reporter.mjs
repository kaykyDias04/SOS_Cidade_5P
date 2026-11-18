import path from 'node:path';
import common from './common.cjs';
export default async function* reporter(events) {
  const records = [];
  const parents = [];
  for await (const { type, data } of events) {
    if (type === 'test:start') { parents.length = data.nesting ?? 0; parents[data.nesting ?? 0] = data.name; }
    if (!['test:pass', 'test:fail'].includes(type) || data.details?.type === 'suite') continue;
    const name = [...parents.slice(0, data.nesting ?? 0), data.name].join(' ');
    records.push({ framework: 'node:test', file: data.file ? common.relative(data.file) : '', name, id: common.idOf(name), status: type === 'test:pass' ? 'passed' : 'failed', durationMs: data.details?.duration_ms ?? 0, attempt: Number(process.env.TEST_ATTEMPT ?? 1), error: data.details?.error?.message ?? '', skipped: Boolean(data.skip) });
  }
  common.save(path.join(process.env.TEST_REPORT_DIR ?? path.join(common.root, 'resultados/gestao/direct-frontend'), 'attempt.json'), { records });
  yield `${records.length} eventos de teste registrados\n`;
}
