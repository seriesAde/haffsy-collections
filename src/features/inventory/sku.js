export function skuPart(value, length = 3) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length)
}

export function generateSku({ name, type, color = '', size = '' }, existingSkus = []) {
  const product = skuPart(name), category = skuPart(type)
  if (!product || !category) return ''
  const prefix = [category, product, skuPart(color), skuPart(size, 5)].filter(Boolean).join('-')
  const used = new Set(existingSkus.map(sku => sku.trim().toUpperCase()))
  let sequence = 1
  while (used.has(prefix + '-' + String(sequence).padStart(3, '0'))) sequence += 1
  return prefix + '-' + String(sequence).padStart(3, '0')
}
