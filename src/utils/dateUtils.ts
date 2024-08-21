export function createCatalogDateString(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}
