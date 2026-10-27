// Teste quebrado DE PROPÓSITO para evidenciar o quality gate: o PR que o contém
// precisa aparecer como "Merging is blocked". Será removido no commit seguinte,
// que mostra o merge liberado. Nunca deve chegar à main.
describe('evidência do quality gate', () => {
  it('falha de propósito para bloquear o merge', () => {
    expect('merge').toBe('bloqueado');
  });
});
