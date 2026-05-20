/// <reference types="cypress" />

describe('Batería de pruebas de smoke sobre la home', () => {

    beforeEach(() => {
        // Antes de cada test abrimos la home y comprobamos que la estructura base está cargada.
        cy.visit('https://footer-shop.vercel.app/home')
        cy.get('header').should('be.visible')
        cy.get('footer').should('be.visible')
    })

    it('ID:TC007 - Verificar elementos visibles del header, cuerpo principal y footer', () => {
        // Validamos los elementos críticos del header.
        cy.get('header a[href="/home"]').should('be.visible').and('contain', 'Footer')
        cy.get('[type="search"]').should('be.visible').and('have.attr', 'placeholder', 'Buscar productos...')
        cy.get('[aria-label="Ver carrito de compras"]').should('not.exist')
        cy.contains('nav a', 'Todos').should('be.visible')
        cy.contains('nav a', 'Zapatillas').should('be.visible')
        cy.contains('nav a', 'Ropa').should('be.visible')
        cy.contains('nav a', 'Complementos').should('be.visible')

        // Revisamos el contenido principal para asegurarnos de que la home muestra su propuesta visual y comercial.
        cy.get('main').should('contain', 'Define Tu Estilo. Conquista la Calle.')
        cy.get('main').should('contain', 'Descubre la nueva colección que fusiona rendimiento y moda urbana.')
        cy.contains('a', 'Descubre la Colección').should('be.visible').and('have.attr', 'href', '/products')
        cy.get('main').should('contain', 'Categorías Destacadas')
        cy.get('main').should('contain', 'Novedades')
        cy.contains('main a', 'Zapatillas').should('be.visible')
        cy.contains('main a', 'Ropa').should('be.visible')
        cy.contains('main a', 'Complementos').should('be.visible')

        // Cerramos la validación comprobando que el footer contiene enlaces y bloques informativos básicos.
        cy.get('footer').should('contain', 'Tu tienda de ropa y complementos de confianza.')
        cy.get('footer').should('contain', 'Tienda')
        cy.get('footer').should('contain', 'Empresa')
        cy.get('footer').should('contain', 'Ayuda')
        cy.contains('footer a', 'Aviso Legal').should('be.visible')
        cy.contains('footer a', 'Privacidad').should('be.visible')
    })

    it('ID:TC008 - Buscar Nike, comprobar resultados, ir a la pagina 3 y abrir el último producto', () => {
        // Simulamos una búsqueda real desde el buscador global del header.
        cy.get('header [type="search"]').should('have.value', '').type('Nike{enter}')

        cy.url().should('include', '/products')
        cy.url().should('include', 'name=Nike')
        cy.get('#product-list-header').should('contain', 'Resultados para "Nike"')

        // Esperamos a que la búsqueda termine y evitamos validar el contador mientras la página sigue cargando.
        cy.contains('h3', 'No se encontraron productos', { timeout: 20000 }).should('not.exist')
        cy.get('app-product-card', { timeout: 20000 }).should('have.length.at.least', 1)
        cy.get('#product-list-header p', { timeout: 20000 })
            .should(($texto) => {
                const texto = $texto.text()
                const coincidencia = texto.match(/Mostrando\s+(\d+)\s+productos/)

                expect(coincidencia, 'texto con total de productos').to.not.be.null
                expect(Number(coincidencia[1]), 'total de productos encontrados').to.be.at.least(1)
            })

        // Navegamos por paginación para comprobar que los resultados siguen siendo accesibles en páginas posteriores.
        cy.get('[aria-label="Ir a la página 3"]', { timeout: 20000 }).should('be.visible').click()
        cy.url().should('include', 'page=3')
        cy.get('[aria-current="page"]').should('contain', '3')
        cy.get('app-product-card', { timeout: 20000 }).should('have.length.at.least', 1)

        // Hacemos click sobre la card completa porque es el elemento más estable para navegar al detalle.
        cy.get('app-product-card').last().click()

        cy.url().should('include', '/products/product/')
        cy.contains('button', 'Añadir a la cesta').should('be.visible')
    })

    it('ID:TC009 - Buscar un producto sin resultados y limpiar la búsqueda después', () => {
        // Forzamos un caso sin resultados para validar el mensaje vacío del listado.
        cy.get('header [type="search"]').type('producto_que_no_existe_qa_2026{enter}')

        cy.url().should('include', '/products')
        cy.get('#product-list-header').should('contain', 'Resultados para "producto_que_no_existe_qa_2026"')
        cy.contains('h3', 'No se encontraron productos').should('be.visible')
        cy.contains('p', 'Intenta ajustar los filtros o busca otro término.').should('be.visible')

        // Limpiamos la búsqueda y repetimos con un término válido para comprobar recuperación del flujo.
        cy.get('header [type="search"]').clear().should('have.value', '').type('Nike{enter}')
        cy.get('#product-list-header').should('contain', 'Resultados para "Nike"')
        cy.get('app-product-card').its('length').should('be.greaterThan', 0)
    })

})
