import FrameworksOverview from '@/components/pages/FrameworksOverview.vue';
import FrameworkDocumentationPage from '@/components/pages/FrameworkDocumentationPage.vue';
import { parseFrameworkSchema } from '@/components/resources/specification/FrameworkSchemaTree';
import { getMountingFunction } from '@ct/testUtils/Mount.ts';
import { minimalKeycloakMock } from '@ct/testUtils/Keycloak.ts';
import { createMemoryHistory, createRouter } from 'vue-router';
import { routes } from '@/router';

const frameworkSchema = {
  general: {
    fiscalYearEnd: { id: 'extendedDateFiscalYearEnd', ref: 'ref-1', aliasExport: 'FISCAL_YEAR_END' },
  },
  emissions: { scope1: { id: 'extendedDecimalScope1', ref: 'ref-2', aliasExport: null } },
};

const sfdr = {
  framework: { id: 'sfdr', ref: 'r1' },
  name: 'SFDR',
  businessDefinition: 'Sustainable finance disclosures',
  schema: JSON.stringify(frameworkSchema),
};
const pcaf = { ...sfdr, framework: { id: 'pcaf', ref: 'r2' }, name: 'PCAF', businessDefinition: 'Carbon accounting' };

/**
 * Stubs the specification endpoints used on the overview and detail pages.
 */
function interceptSpecificationEndpoints(): void {
  cy.intercept('GET', '**/specifications/frameworks', [
    { framework: sfdr.framework, name: 'SFDR' },
    { framework: pcaf.framework, name: 'PCAF' },
  ]).as('listFrameworks');
  cy.intercept('GET', '**/specifications/frameworks/sfdr', sfdr).as('getFramework');
  cy.intercept('GET', '**/specifications/frameworks/pcaf', pcaf);
  cy.intercept('GET', '**/specifications/data-point-types/extendedDecimalScope1', {
    dataPointType: { id: 'extendedDecimalScope1', ref: 'r3' },
    name: 'Scope 1 GHG emissions',
    businessDefinition: 'Direct emissions',
    dataPointBaseType: { id: 'extendedDecimal', ref: 'r4' },
    usedBy: [{ id: 'sfdr', ref: 'r1' }],
    constraints: ['min:0'],
    calculationRules: [{ calculationMethod: 'Sum', inputs: ['extendedDateFiscalYearEnd', 'unknownType'] }],
  }).as('getDataPointType');
  cy.intercept('GET', '**/specifications/data-point-base-types/extendedDecimal', {
    dataPointBaseType: { id: 'extendedDecimal', ref: 'r4' },
    name: 'Extended decimal',
    businessDefinition: 'A decimal value',
    validatedBy: 'SomeValidator',
    example: { value: 1 },
    usedBy: [],
  }).as('getBaseType');
}

describe('Component tests for the framework documentation', () => {
  const keycloak = minimalKeycloakMock({ authenticated: true });

  /**
   * Mounts the detail page at the given url.
   * @param url the route to open
   */
  function mountDetailPage(url: string): void {
    const router = createRouter({ history: createMemoryHistory(), routes });
    router.push(url).catch(console.error);
    getMountingFunction({ keycloak, router })(FrameworkDocumentationPage, {});
  }

  it('parses a framework schema into tree nodes', () => {
    const nodes = parseFrameworkSchema(JSON.stringify(frameworkSchema));
    expect(nodes).to.have.length(2);
    expect(nodes[0]?.label).to.equal('general');
    expect(nodes[0]?.children?.[0]?.leaf).to.equal(true);
    expect(nodes[0]?.children?.[0]?.data.dataPointTypeId).to.equal('extendedDateFiscalYearEnd');
    expect(() => parseFrameworkSchema('[]')).to.throw();
    expect(() => parseFrameworkSchema('not json')).to.throw();
  });

  it('shows framework cards with data point counts', () => {
    interceptSpecificationEndpoints();
    getMountingFunction({ keycloak })(FrameworksOverview, {});
    cy.wait('@listFrameworks');
    cy.get('[data-test="frameworkCard-sfdr"]').should('contain.text', 'SFDR').and('contain.text', '2 data points');
    cy.get('[data-test="frameworkCard-pcaf"]').should('contain.text', 'Carbon accounting');
    cy.get('[data-test="frameworkCard-pcaf"]').should('have.attr', 'href', '/frameworks/pcaf');
    cy.get('[data-test="frameworkCard-pcaf"]').focus().should('have.focus');
  });

  it('suggests grouped results and navigates to the data point', () => {
    interceptSpecificationEndpoints();
    const router = createRouter({ history: createMemoryHistory(), routes });
    getMountingFunction({ keycloak, router })(FrameworksOverview, {});
    cy.get('[data-test="frameworkSearch"] input').should('not.be.disabled').type('scope');
    cy.get('[data-test="dataPointHit"]').should('contain.text', 'emissions.scope1');
    cy.get('[data-test="dataPointHit"]').first().click();
    cy.wrap(router.currentRoute).its('value.fullPath').should('equal', '/frameworks/sfdr?dataPoint=emissions.scope1');
  });

  it('shows a hint when nothing matches', () => {
    interceptSpecificationEndpoints();
    getMountingFunction({ keycloak })(FrameworksOverview, {});
    cy.get('[data-test="frameworkSearch"] input').should('not.be.disabled').type('zzzz');
    cy.get('[data-test="noSearchHits"]').should('be.visible');
  });

  it('shows an error with retry when the frameworks cannot be loaded', () => {
    cy.intercept('GET', '**/specifications/frameworks', { statusCode: 500, body: {} }).as('failing');
    getMountingFunction({ keycloak })(FrameworksOverview, {});
    cy.get('[data-test="frameworksError"]').should('be.visible');
    cy.get('[data-test="retryFrameworks"]').should('be.visible');
  });

  it('opens a data point from a deep link and shows its details', () => {
    interceptSpecificationEndpoints();
    mountDetailPage('/frameworks/sfdr?dataPoint=emissions.scope1');
    cy.wait('@getFramework');
    cy.get('[data-test="frameworkName"]').should('contain.text', 'SFDR');
    cy.get('[data-test="frameworkTree"] [data-p-selected="true"]').should('contain.text', 'scope1');
    cy.get('[data-test="frameworkBreadcrumb"]').should('contain.text', 'emissions').and('contain.text', 'scope1');
    cy.wait('@getDataPointType');
    cy.get('[data-test="dataPointTypeDetails"]')
      .should('contain.text', 'Scope 1 GHG emissions')
      .and('contain.text', 'min:0');
    cy.get('[data-test="calculationInputLink"]').should('have.length', 1);
    cy.get('[data-test="dataPointBaseTypeDetails"]').contains('Base type').click();
    cy.get('[data-test="dataPointBaseTypeDetails"]').should('contain.text', 'Extended decimal');
  });

  it('selects a data point by clicking in the tree', () => {
    interceptSpecificationEndpoints();
    mountDetailPage('/frameworks/sfdr');
    cy.wait('@getFramework');
    cy.get('[data-test="noDataPointSelected"]').should('be.visible');
    cy.get('[data-test="frameworkTree"]').contains('emissions').click();
    cy.get('[data-test="frameworkTree"]').contains('scope1').click();
    cy.wait('@getDataPointType');
    cy.get('[data-test="dataPointTypeDetails"]').should('contain.text', 'Scope 1 GHG emissions');
  });
});
