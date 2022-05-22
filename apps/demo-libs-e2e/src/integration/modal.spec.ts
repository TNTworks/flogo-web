describe('Modal Lib', () => {
  beforeEach(() => {
    cy.visit('/modals');
  });

  it('opens a modal', () => {
    cy.get('[data-testid="user-name"]')
      .clear()
      .type('Ned Stark');
    cy.get('[data-testid="modal-trigger"]').click();

    cy.get('demo-modal-content')
      .should('be.visible')
      .contains('Hello Ned Stark');

    cy.get('[data-testid="modal-response-yes"]').click();

    cy.contains('Ned Stark replied "yup!"');
  });
});
