export enum Category {
  WEB,
  NODE,
  LIBRARY,
}

export abstract class TemplateBase {
  public abstract name: string
  protected abstract category: Category[]

  public isInCategory(category: Category) {
    return this.category.includes(category)
  }
}
