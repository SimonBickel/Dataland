export const dataPointTypeSpecificationKeys = {
  all: ['dataPointTypeSpecification'] as const,
  byId: (dataPointTypeId: string | undefined) =>
    [...dataPointTypeSpecificationKeys.all, 'byId', dataPointTypeId] as const,
};
