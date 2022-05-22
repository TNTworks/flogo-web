import { testId } from '../support/helpers';

describe('Context Panel Lib', () => {
  beforeEach(() => {
    cy.visit('context-panel');
  });

  it('should reveal the panel content when opened', () => {
    const contextPanelContent = 'Inside the context panel';

    cy.get('flogo-context-panel-area').should('exist');
    cy.contains(contextPanelContent).should('not.exist');

    cy.get('flogo-context-panel-header-toggler').click();
    cy.contains(contextPanelContent);
  });

  it('should reveal the context element when the panel opens', () => {
    cy.get(testId('context-element')).should('not.be.visible');
    cy.get('flogo-context-panel-header-toggler').click();
    cy.get(testId('context-element')).should('be.visible');
  });

  it('should have the same title when in open and closed state', () => {
    const expectedTitle = 'I am a cool title';
    cy.get('flogo-context-panel-header-toggler').should('not.contain', expectedTitle);
    cy.get(testId('change-title-btn')).click();
    cy.get('flogo-context-panel-header-toggler').should('contain', expectedTitle);
    cy.get('flogo-context-panel-header-toggler').click();
    cy.get('flogo-context-panel-header-toggler').should('contain', expectedTitle);
  });

  it('should apply custom position for the panel trigger', () => {
    let initialPosition;
    cy.get('flogo-context-panel-header-toggler').then($toggler => {
      initialPosition = $toggler[0].getBoundingClientRect().left;
    });
    cy.get(testId('change-position-btn')).click();
    cy.get('flogo-context-panel-header-toggler').then($toggler => {
      expect($toggler[0].getBoundingClientRect().left).to.be.greaterThan(initialPosition);
    });
  });
});
