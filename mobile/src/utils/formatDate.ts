export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('pt-BR', options);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

export function formatLongDate(iso: string): string {
  return formatDate(iso, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
