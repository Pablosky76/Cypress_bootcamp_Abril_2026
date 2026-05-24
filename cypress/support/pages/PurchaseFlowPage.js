import CommonPage from './CommonPage'

class PurchaseFlowPage extends CommonPage {

    // Navegación propia del flujo de compra.
    visitProducts() {
        this.visit('/products')
    }

    visitCart() {
        this.visit('/cart')
    }

    openFirstProduct() {
        this.visitProducts()
        cy.get('app-product-card', { timeout: this.defaultTimeout }).should('have.length.at.least', 1)
        cy.get('app-product-card').first().click()
        cy.url().should('include', '/products/product/')
        this.getButtonByText('Añadir a la cesta', { timeout: this.defaultTimeout }).should('be.visible')
    }

    openProductByIndex(index) {
        this.visitProducts()
        cy.get('app-product-card', { timeout: this.defaultTimeout }).should('have.length.at.least', index + 1)
        cy.get('app-product-card').eq(index).click()
        cy.url().should('include', '/products/product/')
        this.getButtonByText('Añadir a la cesta', { timeout: this.defaultTimeout }).should('be.visible')
    }

    openProductByName(productName) {
        // Abrimos productos por nombre para evitar depender del orden del listado o de cards inestables.
        this.visitProducts()
        cy.get('header input[name="search"]', { timeout: this.defaultTimeout }).clear().type(`${productName}{enter}`)
        cy.get('app-product-card', { timeout: this.defaultTimeout }).should('have.length.at.least', 1)
        cy.contains('app-product-card', productName).click()
        cy.url().should('include', '/products/product/')
        cy.contains('h1', productName, { timeout: this.defaultTimeout }).should('be.visible')
        this.getButtonByText('Añadir a la cesta', { timeout: this.defaultTimeout }).should('be.visible')
    }

    clickHeaderCart() {
        this.getByAriaLabel('Ver carrito de compras').click()
    }

    // Algunos productos necesitan talla antes de habilitar "Añadir a la cesta".
    selectFirstAvailableSizeIfNeeded() {
        cy.get('body').then(($body) => {
            if ($body.text().includes('Selecciona tu talla')) {
                this.selectFirstAvailableSize()
            } else if ($body.text().includes('Selecciona tu color')) {
                this.selectColorWithAvailableSize()
            }
        })
    }

    selectFirstAvailableSize() {
        // El label de talla y los botones están en divs hermanos:
        // primero localizamos el label y después entramos en el bloque de botones de talla.
        cy.contains('label', 'Selecciona tu talla:')
            .parent()
            .next()
            .find('button')
            .not('[disabled]')
            .first()
            .click({ force: true })
    }

    selectColorWithAvailableSize(colorIndex = 0) {
        cy.contains('label', 'Selecciona tu color:')
            .parent()
            .next()
            .find('button')
            .then(($colorButtons) => {
                if (colorIndex >= $colorButtons.length) return

                cy.wrap($colorButtons.eq(colorIndex)).click({ force: true })
                cy.get('body').then(($updatedBody) => {
                    if ($updatedBody.text().includes('Selecciona tu talla')) {
                        this.selectFirstAvailableSize()
                    } else {
                        // Comportamiento observado: alguna variante/color puede cargar sin talla,
                        // aunque el mismo producto tenga otras variantes con "Talla Única".
                        // Si ocurre, probamos el siguiente color disponible hasta encontrar uno comprable.
                        this.selectColorWithAvailableSize(colorIndex + 1)
                    }
                })
            })
    }

    addCurrentProductToCart() {
        this.selectFirstAvailableSizeIfNeeded()
        this.getButtonByText('Añadir a la cesta', { timeout: this.defaultTimeout }).should('be.enabled').click()
        this.getToastByMessage('Producto añadido a la cesta').should('be.visible')
    }

    emptyCartIfNeeded() {
        this.visitCart()
        this.waitForCartLoaded()
        this.removeCartItemsUntilEmpty()
    }

    waitForCartLoaded() {
        // Esperamos a que el carrito muestre un estado estable: título, cesta vacía o productos.
        cy.get('body', { timeout: this.defaultTimeout }).should(($body) => {
            const pageReady = $body.text().includes('Mi Cesta de la Compra')
            const emptyCart = $body.text().includes('Tu cesta está vacía')
            const hasProducts = $body.find('[aria-label="Eliminar producto"]').length > 0

            expect(pageReady || emptyCart || hasProducts).to.equal(true)
        })
    }

    removeCartItemsUntilEmpty() {
        // Borramos recursivamente porque la cesta puede traer productos de ejecuciones anteriores.
        cy.get('body').then(($body) => {
            const removeButtons = $body.find('[aria-label="Eliminar producto"]').length

            if (removeButtons > 0) {
                this.getByAriaLabel('Eliminar producto').first().click()
                if (removeButtons > 1) {
                    this.getByAriaLabel('Eliminar producto', { timeout: this.defaultTimeout }).should('have.length', removeButtons - 1)
                } else {
                    cy.contains('Tu cesta está vacía', { timeout: this.defaultTimeout }).should('be.visible')
                }
                this.removeCartItemsUntilEmpty()
            } else {
                cy.contains('Tu cesta está vacía', { timeout: this.defaultTimeout }).should('be.visible')
            }
        })
    }

    assertCartItems(totalItems) {
        cy.url().should('include', '/cart')
        this.getByAriaLabel('Eliminar producto', { timeout: this.defaultTimeout }).should('have.length', totalItems)
        cy.contains('h1', 'Mi Cesta de la Compra').should('be.visible')
    }

    removeFirstCartItem() {
        this.getByAriaLabel('Eliminar producto', { timeout: this.defaultTimeout }).first().click()
    }

    assertEmptyCart() {
        cy.contains('Tu cesta está vacía', { timeout: this.defaultTimeout }).should('be.visible')
        this.getByAriaLabel('Eliminar producto').should('not.exist')
    }

    createShippingAddress() {
        // El checkout exige una dirección con teléfono. Creamos una fija solo si no existe,
        // evitando acumular direcciones iguales en cada ejecución.
        this.visit('/profile/addresses')

        cy.get('body', { timeout: this.defaultTimeout }).then(($body) => {
            if ($body.text().includes('Casa Cypress')) return

            cy.contains('button', 'Añadir Nueva Dirección').click()
            this.getByFormControl('alias').clear().type('Casa Cypress')
            this.getByFormControl('street').clear().type('Calle Cypress 1')
            this.getByFormControl('city').clear().type('Madrid')
            this.getByFormControl('state').clear().type('Madrid')
            this.getByFormControl('postalCode').clear().type('28001')
            this.getByFormControl('country').clear().type('España')
            this.getByFormControl('phone').clear().type('600123123')
            this.getByFormControl('isDefault').check({ force: true })
            cy.contains('button', 'Guardar Dirección').click()
            cy.contains('Casa Cypress', { timeout: this.defaultTimeout }).should('be.visible')
        })
    }

    ensureShippingAddressInCart() {
        // Si el carrito no tiene direcciones disponibles, usamos el enlace de la propia UI.
        cy.get('body', { timeout: this.defaultTimeout }).then(($body) => {
            if ($body.text().includes('No tienes direcciones guardadas.')) {
                cy.contains('a', 'Añadir una dirección').click()
                this.createShippingAddress()
                this.visitCart()
            }
        })
    }

    selectShippingAddress() {
        // Si existe nuestra dirección de prueba, la seleccionamos para habilitar el botón de pago.
        this.ensureShippingAddressInCart()

        cy.get('body', { timeout: this.defaultTimeout }).then(($body) => {
            if ($body.text().includes('Casa Cypress')) {
                cy.contains('p', 'Casa Cypress')
                    .closest('div[class*="cursor-pointer"]')
                    .click()
            }
        })
    }

    clickSecurePayment() {
        this.selectShippingAddress()
        this.getButtonByText('Pagar de forma segura').should('be.enabled').click()
    }

    assertStripeCheckoutRedirect() {
        // Stripe Checkout no puede renderizarse dentro del iframe de Cypress.
        // Por eso validamos que la app redirige correctamente al checkout externo.
        cy.location('hostname', { timeout: this.defaultTimeout }).should('eq', 'checkout.stripe.com')
        cy.location('pathname').should('include', '/c/pay/')
    }

    goToOrderHistoryFromConfirmation() {
        // Este flujo queda preparado por si la app permite volver desde Stripe a confirmación.
        // En Cypress no lo usamos ahora porque Stripe Checkout bloquea el render dentro del iframe.
        cy.contains('¡Compra Realizada!', { timeout: 60000 }).should('be.visible')
        cy.contains('a', 'Ir a mis pedidos').click()
        cy.url().should('include', '/profile/orders')
        cy.contains('Historial de Pedidos', { timeout: 20000 }).should('be.visible')
        cy.contains('Pedido #', { timeout: 20000 }).should('be.visible')
    }
}

export default new PurchaseFlowPage()
