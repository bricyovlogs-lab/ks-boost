import crypto from 'crypto'
export function createKey(prefix='VKS') { return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}` }
