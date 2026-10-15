// Run with: npx tsx src/libs/csv.selfcheck.ts
import assert from 'node:assert/strict'

import { fetchAllPages, toCsv } from './csv'

assert.equal(toCsv([['a', 'b,c', 'd"e']]), 'a,"b,c","d""e"')
assert.equal(toCsv([['=1+1', '+x', '-y', '@z', 'ok']]), "'=1+1,'+x,'-y,'@z,ok")
assert.equal(toCsv([['line\nbreak', null, undefined, 0, false]]), '"line\nbreak",,,0,false')

;(async () => {
  const pages = [
    { items: [1, 2], page: 1, pageSize: 2, total: 5, hasMore: true },
    { items: [3, 4], page: 2, pageSize: 2, total: 5, hasMore: true },
    { items: [5], page: 3, pageSize: 2, total: 5, hasMore: false }
  ]

  assert.deepEqual(await fetchAllPages(async p => pages[p - 1]), { items: [1, 2, 3, 4, 5], truncated: false })
  assert.deepEqual(await fetchAllPages(async p => pages[p - 1], 3), { items: [1, 2, 3], truncated: true })
  console.log('csv selfcheck ok')
})()
