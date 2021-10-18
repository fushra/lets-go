import { Category, TemplateBase } from './base'

class TestApp extends TemplateBase {
  name = 'Test App'
  protected category = [Category.LIBRARY, Category.NODE]
}

test('Has a name', () => {
  const app = new TestApp()
  expect(app.name).toBe('Test App')
})

test('Is in category "LIBRARY"', () => {
  const app = new TestApp()
  expect(app.isInCategory(Category.LIBRARY)).toBe(true)
})

test('Is in category "NODE"', () => {
  const app = new TestApp()
  expect(app.isInCategory(Category.NODE)).toBe(true)
})

test('not be in category "WEB"', () => {
  const app = new TestApp()
  expect(app.isInCategory(Category.WEB)).toBe(false)
})
