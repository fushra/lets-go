import { Group, Step } from '../templates/base'

export const removeFromSteps = (
  steps: Step[],
  filter: (step: Step) => boolean
): Step[] =>
  steps
    .filter(filter)
    .map((step) =>
      step instanceof Group
        ? step.updateSteps(removeFromSteps(step.steps, filter))
        : step
    )

/**
 * Maps all steps, excluding Group steps, which it steps into
 * @param steps
 * @param fn
 * @returns
 */
export const mapAllSteps = (steps: Step[], fn: (step: Step) => Step): Step[] =>
  steps.map((step) =>
    step instanceof Group
      ? step.updateSteps(mapAllSteps(step.steps, fn))
      : fn(step)
  )

export const flattenSteps = (steps: Step[]) =>
  steps
    .map((step) => [step])
    .reduce(
      (prev, step) =>
        step[0] instanceof Group
          ? [...prev, ...step[0].steps]
          : [...prev, step[0]],
      []
    )
