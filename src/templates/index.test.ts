import { allTemplates } from '.'

function hasDuplicates(array: any[]): boolean {
  return new Set(array.map((item) => item.name)).size !== array.length
}

test('Has duplicates', () => {
  expect(hasDuplicates(allTemplates)).toBe(false)
})
