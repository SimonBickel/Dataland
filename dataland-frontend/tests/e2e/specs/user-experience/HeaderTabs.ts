import { describeIf } from '@e2e/support/TestUtility';
import { DataTypeEnum } from '@clients/backend';

describeIf(
  'Test header tabs visibility for user role',
  {
    executionEnvironments: ['developmentLocal', 'ci', 'developmentCd'],
  },
  () => {
    const tabNames = ['COMPANIES', 'FRAMEWORKS', 'MY DATASETS', 'MY PORTFOLIOS', 'MY DATA REQUESTS'];
    const dummyCompany = {
      companyId: 'dummy-company-id',
      companyName: 'Dummy Company',
    };

    const assertTabVisibility = (tabName: string, isVisible: boolean): void => {
      cy.contains(tabName).should(isVisible ? 'be.visible' : 'not.exist');
    };

    const assertHeaderTabsVisibility = (isVisible: boolean): void => {
      for (const tab of tabNames) {
        assertTabVisibility(tab, isVisible);
      }
    };

    const visitPagesAndCheckTabsVisibility = (urls: string[], isVisible: boolean): void => {
      for (const url of urls) {
        cy.visitAndCheckAppMount(url);
        assertHeaderTabsVisibility(isVisible);
      }
    };

    it('shows no tabs when not logged in', () => {
      visitPagesAndCheckTabsVisibility(['/', '/terms'], false);
    });

    it('shows tabs on company pages', () => {
      cy.ensureLoggedInAsUploader();
      cy.intercept('GET', '/api/companies/meta-information', []);
      cy.intercept('GET', '/api/companies*', []);
      cy.intercept('GET', '/api/metadata*', []);
      cy.intercept('GET', `/api/companies/${dummyCompany.companyId}/info`, []);
      visitPagesAndCheckTabsVisibility(
        [
          '/companies',
          '/companies/choose',
          `/companies/${dummyCompany.companyId}`,
          `/companies/${dummyCompany.companyId}/frameworks/${DataTypeEnum.EutaxonomyNonFinancials}`,
          `/companies/${dummyCompany.companyId}/frameworks/${DataTypeEnum.EutaxonomyNonFinancials}/upload`,
          `/companies/${dummyCompany.companyId}/frameworks/upload`,
          `/companies/${dummyCompany.companyId}/documents`,
        ],
        true
      );
    });

    it('shows tabs on datasets pages', () => {
      cy.ensureLoggedInAsUploader();
      visitPagesAndCheckTabsVisibility(['/datasets'], true);
    });

    it('navigates from the FRAMEWORKS tab to a framework documentation page', () => {
      cy.ensureLoggedInAsReader();
      const framework = { framework: { id: 'sfdr', ref: 'r1' }, name: 'SFDR' };
      cy.intercept('GET', '**/specifications/frameworks', [framework]).as('listFrameworks');
      cy.intercept('GET', '**/specifications/frameworks/sfdr', {
        ...framework,
        businessDefinition: 'Sustainable finance disclosures',
        schema: JSON.stringify({ general: { fiscalYearEnd: { id: 'extendedDateFiscalYearEnd', ref: 'r2' } } }),
      }).as('getFramework');

      cy.visitAndCheckAppMount('/companies');
      cy.contains('FRAMEWORKS').click();
      cy.url().should('match', /\/frameworks$/);
      cy.wait('@listFrameworks');
      cy.get('[data-test="frameworksHeadline"]').should('be.visible');
      cy.get('[data-test="frameworkCard-sfdr"]').click();
      cy.url().should('include', '/frameworks/sfdr');
      cy.wait('@getFramework');
      cy.get('[data-test="frameworkName"]').should('contain.text', 'SFDR');
    });

    it('shows tabs on portfolios pages', () => {
      cy.ensureLoggedInAsReader();
      visitPagesAndCheckTabsVisibility(['/portfolios'], true);
    });

    it('shows tabs on data requests pages', () => {
      cy.ensureLoggedInAsReader();
      visitPagesAndCheckTabsVisibility(['/requests'], true);
    });
  }
);
