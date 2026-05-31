const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // cypress-plugin-api usa Cypress.env() internamente para algunas opciones visuales.
  // Lo dejamos activado para que cy.api() funcione correctamente en los tests de API.
  allowCypressEnv: true,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
