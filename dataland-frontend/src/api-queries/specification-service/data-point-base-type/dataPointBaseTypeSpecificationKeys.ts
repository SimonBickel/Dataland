export const dataPointBaseTypeSpecificationKeys = {
  all: ['dataPointBaseTypeSpecification'] as const,
  byId: (dataPointBaseTypeId: string | undefined) =>
    [...dataPointBaseTypeSpecificationKeys.all, 'byId', dataPointBaseTypeId] as const,
};
