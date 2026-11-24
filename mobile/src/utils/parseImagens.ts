export function parseImagens(imagens: string | string[] | null | undefined): string[] {
  if (!imagens) return [];
  if (Array.isArray(imagens)) {
    return imagens.filter((imagem): imagem is string => typeof imagem === 'string');
  }

  try {
    const parsed: unknown = JSON.parse(imagens);
    return Array.isArray(parsed)
      ? parsed.filter((imagem): imagem is string => typeof imagem === 'string')
      : [];
  } catch {
    return [];
  }
}
