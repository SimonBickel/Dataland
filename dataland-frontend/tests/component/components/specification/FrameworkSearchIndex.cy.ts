import { buildDataPointIndex, searchDocumentation } from '@/components/resources/specification/FrameworkSearchIndex';
import type { FrameworkSpecification } from '@clients/specificationservice';

const specification: FrameworkSpecification = {
  framework: { id: 'sfdr', ref: 'r' },
  name: 'SFDR',
  businessDefinition: 'def',
  schema: JSON.stringify({
    emissions: {
      scope1: { id: 'extendedDecimalScope1', ref: 'r1', aliasExport: 'SCOPE_1' },
      scope2: { id: 'extendedDecimalScope2', ref: 'r2', aliasExport: null },
    },
  }),
};

describe('Unit tests for the framework search index', () => {
  const frameworks = [{ id: 'sfdr', name: 'SFDR' }];
  const index = buildDataPointIndex([specification, { ...specification, schema: 'broken' }]);

  it('flattens leaves and skips unreadable schemas', () => {
    expect(index).to.have.length(2);
    expect(index[0]?.path).to.equal('emissions.scope1');
  });

  it('groups and ranks hits, matching path, id and alias', () => {
    const groups = searchDocumentation('scope_1', frameworks, index);
    expect(groups).to.have.length(1);
    expect(groups[0]?.label).to.equal('Data points');
    expect(searchDocumentation('sfd', frameworks, index)[0]?.label).to.equal('Frameworks');
    expect(searchDocumentation('scope', frameworks, index)[0]?.items).to.have.length(2);
  });

  it('returns nothing for empty or unmatched input', () => {
    expect(searchDocumentation('  ', frameworks, index)).to.have.length(0);
    expect(searchDocumentation('zzz', frameworks, index)).to.have.length(0);
  });
});
