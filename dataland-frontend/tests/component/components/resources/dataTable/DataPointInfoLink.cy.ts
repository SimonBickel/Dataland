import DataPointInfoLink from '@/components/resources/dataTable/DataPointInfoLink.vue';
import { minimalKeycloakMock } from '@ct/testUtils/Keycloak';

describe('Component tests for the DataPointInfoLink', () => {
  /**
   * Mounts the component with a stubbed list of framework specifications
   * @param frameworkIds the ids of the frameworks the specification service knows
   */
  function mountComponent(frameworkIds: string[]): void {
    cy.intercept(
      '/specifications/frameworks',
      frameworkIds.map((id) => ({ framework: { id } }))
    );
    //@ts-ignore
    cy.mountWithPlugins(DataPointInfoLink, {
      keycloak: minimalKeycloakMock({}),
      props: { frameworkId: 'sfdr', dataPointTypeId: 'extendedEnum', explanation: 'Some explanation' },
    });
  }

  it('links to the documentation when a specification exists', () => {
    mountComponent(['sfdr']);
    cy.get('[data-test="dataPointDocumentationLink"]').should(
      'have.attr',
      'href',
      '/frameworks/sfdr?dataPointTypeId=extendedEnum'
    );
  });

  it('shows only the icon when no specification exists', () => {
    mountComponent(['lksg']);
    cy.get('.material-icons').should('exist');
    cy.get('[data-test="dataPointDocumentationLink"]').should('not.exist');
  });
});
