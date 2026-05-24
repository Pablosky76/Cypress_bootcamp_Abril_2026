class CommonPage {

    // Timeout común para no repetir tiempos de espera en cada selector.
    defaultTimeout = 6500

    // Selectores genéricos reutilizables por cualquier page object.
    getByAttribute(attr, value, options = {}) {
        return cy.get(`[${attr}="${value}"]`, options)
    }

    getByAriaLabel(label, options = {}) {
        return this.getByAttribute('aria-label', label, options)
    }

    getByFormControl(name, options = {}) {
        return this.getByAttribute('formcontrolname', name, options)
    }

    getByHref(path, options = {}) {
        return this.getByAttribute('href', path, options)
    }

    getByType(type, options = {}) {
        return this.getByAttribute('type', type, options)
    }

    getByPlaceholder(placeholder, options = {}) {
        return this.getByAttribute('placeholder', placeholder, options)
    }

    getButtonByText(text, options = { timeout: this.defaultTimeout }) {
        return cy.contains('button', text, options)
    }

    getToastByMessage(message) {
        return cy.contains('app-toast', message, { timeout: this.defaultTimeout })
    }

    // Construye la URL base de la app para visitar rutas internas con menos repetición.
    visit(path) {
        cy.visit(`https://footer-shop.vercel.app${path}`)
    }

    // Login común porque lo necesitamos como precondición en varios flujos.
    login(email, password) {
        this.visit('/login')
        this.getByType('email').type(email)
        this.getByFormControl('password').type(password)
        this.getByType('submit').should('be.enabled').click()
        this.getByAriaLabel('Ver perfil de usuario', { timeout: this.defaultTimeout }).should('be.visible')
    }

    // Aserción común para mensajes toast de la aplicación.
    assertToastMessage(message) {
        this.getToastByMessage(message).should('be.visible')
        cy.get('app-toast', { timeout: this.defaultTimeout }).should('not.be.visible')
    }
}

export default CommonPage
