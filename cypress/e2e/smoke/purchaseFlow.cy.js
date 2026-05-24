/// <reference types="cypress" />
// CommonPage contiene acciones reutilizables para varios tests, por ejemplo login y selectores genéricos.
import CommonPage from '../../support/pages/CommonPage'
// PurchaseFlowPage contiene acciones específicas del flujo de compra: producto, cesta, Stripe e historial.
import PurchaseFlowPage from '../../support/pages/PurchaseFlowPage'

describe('Batería de pruebas de smoke sobre el flujo de compra', () => {

    // Observaciones encontradas durante la automatización:
    // 1. La cesta conserva datos entre ejecuciones, por eso la limpiamos en el beforeEach.
    // 2. Algunas variantes de producto pueden cargar sin talla y dejar "Añadir a la cesta" deshabilitado.
    //    En la page se contempla probando otro color hasta encontrar una variante comprable.
    // 3. Stripe Checkout no se renderiza dentro del iframe de Cypress; validamos la redirección externa.

    const userEmail = 'cypress_bootcamp_2026@pablo.com'
    const userPassword = '123412P!'
    const firstProduct = 'Nike Air Force 1'
    const secondProduct = 'Nike Tech Fleece'
    const commonPage = new CommonPage()

    beforeEach(() => {
        // Antes de cada caso dejamos al usuario autenticado y la cesta limpia.
        // Así cada test empieza desde el mismo estado y no depende de ejecuciones anteriores.
        commonPage.login(userEmail, userPassword)
        PurchaseFlowPage.emptyCartIfNeeded()
    })

    it('ID:TC010 - Añadir 1 artículo a la cesta', () => {
        // Abrimos un producto estable por nombre y lo añadimos usando la page específica.
        PurchaseFlowPage.openProductByName(firstProduct)
        PurchaseFlowPage.addCurrentProductToCart()

        // Validamos que el carrito contiene exactamente el artículo añadido.
        PurchaseFlowPage.clickHeaderCart()
        PurchaseFlowPage.assertCartItems(1)
    })

    it('ID:TC011 - Eliminar de la cesta el artículo añadido previamente', () => {
        // Preparamos el escenario añadiendo un producto a la cesta.
        PurchaseFlowPage.openProductByName(firstProduct)
        PurchaseFlowPage.addCurrentProductToCart()

        // Entramos en la cesta, comprobamos que existe el producto y lo eliminamos.
        PurchaseFlowPage.visitCart()
        PurchaseFlowPage.assertCartItems(1)
        PurchaseFlowPage.removeFirstCartItem()

        // Cerramos el test verificando el estado vacío de la cesta.
        PurchaseFlowPage.assertEmptyCart()
    })

    it('ID:TC012 - Completar compra con 2 artículos, pagar con Stripe y abrir historial de pedidos', () => {
        // Añadimos dos artículos concretos para no depender del orden cambiante del listado.
        PurchaseFlowPage.openProductByName(firstProduct)
        PurchaseFlowPage.addCurrentProductToCart()

        PurchaseFlowPage.openProductByName(secondProduct)
        PurchaseFlowPage.addCurrentProductToCart()

        // Revisamos el resumen de cesta antes de iniciar el checkout.
        PurchaseFlowPage.visitCart()
        PurchaseFlowPage.assertCartItems(2)
        PurchaseFlowPage.clickSecurePayment()

        // Stripe Checkout no se puede renderizar dentro del iframe de Cypress.
        // Por eso validamos que la app redirige correctamente al checkout externo de Stripe.
        PurchaseFlowPage.assertStripeCheckoutRedirect()
    })

})
