export const frameworkSpecificationKeys = {
  all: ['frameworkSpecification'] as const,
  list: () => [...frameworkSpecificationKeys.all, 'list'] as const,
  byId: (frameworkId: string | undefined) => [...frameworkSpecificationKeys.all, 'byId', frameworkId] as const,
};
