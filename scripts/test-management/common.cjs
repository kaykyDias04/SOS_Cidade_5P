const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const policy = require('./policy.json');
const registry = require('./quarantine.json');
const tag = /(?:^|\s)@flaky(?=\s|$)/;
const idOf = name => name.match(/\b(?:CT-[A-Z0-9]+|UN-[A-Z]+|ATDD|BDD|TDD)-\d+[ab]?\b/)?.[0] ?? null;
const relative = file => path.relative(root, file).replaceAll('\\', '/');
function save(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}
function integer(value, fallback, min = 0, max = 20) {
  const n = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw Error(`Valor inválido: ${value}`);
  return n;
}
function inventory() {
  const ts = require(path.join(root, 'backend/node_modules/typescript'));
  const rows = [];
  for (const folder of ['tests', 'backend/tests/unit', 'frontend/tests', 'e2e/tests']) {
    for (const file of fs.readdirSync(path.join(root, folder), { recursive: true })) {
      if (!/\.(test|spec)\.(ts|mjs)$/.test(file)) continue;
      const full = path.join(root, folder, file);
      const source = ts.createSourceFile(full, fs.readFileSync(full, 'utf8'), ts.ScriptTarget.Latest, true);
      function walk(node, parents = [], inheritedDisabled = false, serial = false) {
        if (ts.isCallExpression(node)) {
          const callee = node.expression.getText(source);
          const titleNode = node.arguments[0];
          if (/^(?:test|it|describe)(?:\.(?:describe|serial|skip|only|todo))*$/.test(callee) && titleNode && ts.isStringLiteralLike(titleNode)) {
            const title = titleNode.text;
            const group = /describe/.test(callee);
            const disabled = inheritedDisabled || /\.(skip|todo|only)/.test(callee);
            rows.push({ file: relative(full), title, name: [...parents, title].join(' '), id: idOf([...parents, title].join(' ')), group, line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1, disabled, serial });
            for (const child of node.arguments) ts.forEachChild(child, n => walk(n, group ? [...parents, title] : parents, disabled, serial || /\.serial/.test(callee)));
            return;
          }
        }
        ts.forEachChild(node, n => walk(n, parents, inheritedDisabled, serial));
      }
      walk(source);
    }
  }
  return rows;
}
function validate(rows) {
  const full = rows === undefined;
  rows ??= inventory();
  if (full) {
    for (const id of policy.criticalIds) if (!rows.some(r => !r.group && r.id === id && !r.disabled)) throw Error(`Teste crítico ausente/desativado: ${id}`);
    for (const e of policy.criticalTests ?? []) if (!rows.some(r => !r.group && r.file === e.file && r.title === e.title && !r.disabled)) throw Error(`Teste crítico ausente/desativado: ${e.file}: ${e.title}`);
  }
  const tagged = rows.filter(r => tag.test(r.title));
  for (const r of tagged) {
    if (r.group || !r.id || r.disabled || r.serial) throw Error(`@flaky exige ID, teste ativo individual e independente: ${r.file}:${r.line}`);
    if (policy.criticalIds.includes(r.id) || policy.criticalFiles.includes(r.file)) throw Error(`Teste crítico não pode entrar em quarentena: ${r.id}`);
    if (registry.filter(e => e.id === r.id && e.file === r.file && e.title === r.title).length !== 1) throw Error(`Registro de quarentena ausente ou duplicado: ${r.id}`);
  }
  for (const e of registry) {
    for (const field of ['id', 'file', 'title', 'reason', 'owner', 'since', 'exitCondition', 'evidence', 'approvedBy']) {
      if (typeof e[field] !== 'string' || !e[field].trim()) throw Error(`Campo obrigatório: ${e.id}.${field}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.since) || !Number.isFinite(Date.parse(e.since)) || Date.parse(e.since) > Date.now()) throw Error(`Data inválida: ${e.id}`);
    if (tagged.filter(r => r.id === e.id && r.file === e.file && r.title === e.title).length !== 1) throw Error(`Registro sem teste único: ${e.id}`);
    if (e.exitVerification && (!/^[a-f0-9]{40}$/.test(e.exitVerification.commit ?? '') || !/^[a-f0-9]{64}$/.test(e.exitVerification.sourceDigest ?? '') || !/^[a-f0-9]{64}$/.test(e.exitVerification.environmentKey ?? '') || !Number.isFinite(Date.parse(e.exitVerification.fixedAt)))) throw Error(`Verificação de saída inválida: ${e.id}`);
  }
  return rows;
}
module.exports = { root, policy, registry, tag, idOf, relative, save, integer, inventory, validate };
