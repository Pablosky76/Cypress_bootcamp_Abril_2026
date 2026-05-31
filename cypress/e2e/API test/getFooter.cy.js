/// <reference types="cypress" />
// Sirve para que el editor conozca los comandos de Cypress, por ejemplo cy.api().

describe('Batería de pruebas GET sobre la API de Footer', () => {
    // describe agrupa varios tests que pertenecen a la misma batería de pruebas.
    // En este caso todos son tests de tipo GET contra la API de Footer.

    // Chuleta rápida para explicar en clase:
    // - cy.api() hace una petición HTTP directamente a la API.
    // - cy.api() viene del plugin cypress-plugin-api.
    // - Es parecido a cy.request(), pero enseña la respuesta más bonita en el runner de Cypress.
    // - GET significa que solo pedimos información, no creamos ni modificamos datos.
    // - then((response) => {}) espera la respuesta y nos deja revisarla.
    // - response.status es el código HTTP, por ejemplo 200 si todo va bien.
    // - response.body es el contenido que devuelve la API.
    // - expect() sirve para hacer las aserciones, es decir, las comprobaciones del test.

    // Guardamos la URL base en una constante para no repetirla en todos los tests.
    // Así, si mañana cambia el dominio, solo habría que modificar esta línea.
    const apiUrl = 'https://footer-back.onrender.com/api'

    // Usuario de pruebas que ya usamos en los tests de login de la web.
    // Lo necesitamos para pedir el carrito, porque el carrito es privado.
    // En un proyecto real no dejaríamos contraseñas escritas en el test,
    // pero para el ejercicio de clase usamos el usuario de pruebas del bootcamp.
    const userEmail = 'cypress_bootcamp_2026@pablo.com'
    const userPassword = '123412P!'

    it('ID:TC013 - GET listado general de productos', () => {
        // it define un caso de prueba concreto.
        // Aquí pedimos el listado general de productos.
        // La respuesta viene paginada, por eso trae datos como currentPage, totalItems y products.
        cy.api('GET', `${apiUrl}/products/`).then((response) => {
            // Comprobamos que la API responde correctamente.
            expect(response.status).to.eq(200)

            // Comprobamos que estamos en la primera página del listado.
            expect(response.body.currentPage).to.eq(1)

            // Comprobamos que la tienda tiene al menos un producto.
            expect(response.body.totalItems).to.be.greaterThan(0)

            // Comprobamos que products es un array, porque esperamos una lista de productos.
            expect(response.body.products).to.be.an('array')

            // Comprobamos que ese array no viene vacío.
            expect(response.body.products.length).to.be.greaterThan(0)

            // Revisamos el primer producto para comprobar que tiene los campos principales que usa la tienda.
            // Usamos products[0] porque es el primer elemento del array.
            expect(response.body.products[0]).to.have.property('id')
            expect(response.body.products[0]).to.have.property('name')
            expect(response.body.products[0]).to.have.property('price')
            expect(response.body.products[0]).to.have.property('category')
        })
    })

    it('ID:TC014 - GET listado de productos indicando page=1', () => {
        // Este endpoint pide la primera página de forma explícita con query param.
        // El query param es la parte que va después del ?, en este caso page=1.
        cy.api('GET', `${apiUrl}/products?page=1`).then((response) => {
            // 200 significa que la petición ha sido correcta.
            expect(response.status).to.eq(200)

            // La API nos confirma que ha devuelto la página 1.
            expect(response.body.currentPage).to.eq(1)

            // Al estar en la primera página, no debería existir página anterior.
            expect(response.body.prevPage).to.eq(null)

            // Comprobamos que existe al menos una página de resultados.
            expect(response.body.totalPages).to.be.greaterThan(0)

            // products debe ser una lista.
            expect(response.body.products).to.be.an('array')

            // Y esa lista debe tener productos.
            expect(response.body.products.length).to.be.greaterThan(0)
        })
    })

    it('ID:TC015 - GET productos filtrados por categoría zapatillas', () => {
        // Pedimos solo productos de la categoría zapatillas.
        cy.api('GET', `${apiUrl}/products?category=zapatillas`).then((response) => {
            // Validamos que la respuesta de la API ha ido bien.
            expect(response.status).to.eq(200)

            // El filtro empieza mostrando la primera página.
            expect(response.body.currentPage).to.eq(1)

            // Si totalItems es mayor que 0, significa que hay productos en esta categoría.
            expect(response.body.totalItems).to.be.greaterThan(0)

            // products debe ser un array porque puede devolver varios productos.
            expect(response.body.products).to.be.an('array')

            // El array debe venir con información.
            expect(response.body.products.length).to.be.greaterThan(0)

            // Recorremos todos los productos recibidos para asegurar que el filtro se ha aplicado bien.
            // forEach repite las mismas comprobaciones para cada producto del array.
            response.body.products.forEach((product) => {
                // Todos los productos devueltos deben ser de la categoría zapatillas.
                expect(product.category).to.eq('zapatillas')

                // El nombre debe ser texto y no puede venir vacío.
                expect(product.name).to.be.a('string').and.not.be.empty

                // El precio en esta API viene como texto, por ejemplo "129.99".
                expect(product.price).to.be.a('string').and.not.be.empty
            })
        })
    })

    it('ID:TC016 - GET productos filtrados por categoría ropa', () => {
        // Pedimos solo productos de ropa y validamos que no se mezclan otras categorías.
        cy.api('GET', `${apiUrl}/products?category=ropa`).then((response) => {
            // La API debe responder con OK.
            expect(response.status).to.eq(200)

            // Comprobamos que estamos en la página 1 del filtro.
            expect(response.body.currentPage).to.eq(1)

            // Debe haber productos de ropa.
            expect(response.body.totalItems).to.be.greaterThan(0)

            // La respuesta debe traer un array de productos.
            expect(response.body.products).to.be.an('array')

            // Ese array debe contener al menos un producto.
            expect(response.body.products.length).to.be.greaterThan(0)

            // Revisamos cada producto para comprobar categoría, nombre e imagen.
            response.body.products.forEach((product) => {
                // Si el filtro funciona, todos tienen que ser ropa.
                expect(product.category).to.eq('ropa')

                // El producto debe tener nombre.
                expect(product.name).to.be.a('string').and.not.be.empty

                // La imagen debe ser una URL, por eso comprobamos que contiene https://.
                expect(product.image).to.include('https://')
            })
        })
    })

    it('ID:TC017 - GET productos filtrados por categoría complementos', () => {
        // Pedimos solo complementos. Además de la categoría, comprobamos datos básicos de cada producto.
        cy.api('GET', `${apiUrl}/products?category=complementos`).then((response) => {
            // Validamos que la llamada devuelve código 200.
            expect(response.status).to.eq(200)

            // Igual que en los otros listados, debe empezar en la página 1.
            expect(response.body.currentPage).to.eq(1)

            // Debe haber resultados para complementos.
            expect(response.body.totalItems).to.be.greaterThan(0)

            // products debe ser una lista.
            expect(response.body.products).to.be.an('array')

            // La lista no debe estar vacía.
            expect(response.body.products.length).to.be.greaterThan(0)

            // Validamos todos los productos devueltos por el endpoint.
            response.body.products.forEach((product) => {
                // Todos deben ser de la categoría complementos.
                expect(product.category).to.eq('complementos')

                // La marca debe existir y ser texto.
                expect(product.brand).to.be.a('string').and.not.be.empty

                // is_active indica que el producto está activo en la tienda.
                expect(product.is_active).to.eq(true)
            })
        })
    })

    it('ID:TC018 - GET detalle del producto 141', () => {
        // Este test consulta un producto concreto. El id 141 corresponde a Nike Club Fleece.
        // A diferencia del listado, aquí esperamos un solo objeto de producto.
        cy.api('GET', `${apiUrl}/products/141`).then((response) => {
            // La petición al detalle debe ser correcta.
            expect(response.status).to.eq(200)

            // Comprobamos que nos devuelve exactamente el producto que hemos pedido.
            expect(response.body.id).to.eq(141)
            expect(response.body.name).to.eq('Nike Club Fleece')
            expect(response.body.brand).to.eq('Nike')
            expect(response.body.category).to.eq('complementos')

            // En el detalle vienen más datos que en el listado, como imágenes y variantes.
            // images debe ser un array porque un producto puede tener varias imágenes.
            expect(response.body.images).to.be.an('array')
            expect(response.body.images.length).to.be.greaterThan(0)

            // variants debe ser un array porque un producto puede tener tallas, colores o stock distinto.
            expect(response.body.variants).to.be.an('array')
            expect(response.body.variants.length).to.be.greaterThan(0)
        })
    })

    it('ID:TC019 - GET productos relacionados del producto 141', () => {
        // Este endpoint devuelve un array directamente, no un objeto paginado.
        // Sirve para pintar productos recomendados o parecidos en la ficha del producto.
        cy.api('GET', `${apiUrl}/products/141/related`).then((response) => {
            // Comprobamos que la petición responde bien.
            expect(response.status).to.eq(200)

            // Aquí el body completo debe ser un array.
            expect(response.body).to.be.an('array')

            // Debe devolver al menos un producto relacionado.
            expect(response.body.length).to.be.greaterThan(0)

            // Los relacionados no deberían devolver el mismo producto 141 y deben tener datos básicos para pintarlos en cards.
            response.body.forEach((product) => {
                // El producto relacionado no debe ser el mismo que estamos consultando.
                expect(product.id).to.not.eq(141)

                // Debe tener nombre para mostrarlo en pantalla.
                expect(product.name).to.be.a('string').and.not.be.empty

                // Debe tener imagen para la card del producto.
                expect(product.image).to.include('https://')

                // Para este producto, los relacionados que devuelve la API son complementos.
                expect(product.category).to.eq('complementos')
            })
        })
    })

    it('ID:TC020 - GET carrito iniciando sesión antes', () => {
        // El carrito es privado, por eso primero hacemos login contra la API.
        // El login nos devuelve un token, que es como una "llave" para poder pedir el carrito.
        // Importante: aunque el ejercicio pide probar el endpoint GET /cart,
        // antes hacemos un POST /auth/login solo como preparación del test.
        // Es igual que iniciar sesión en la web antes de entrar en "Mi carrito".
        cy.api('POST', `${apiUrl}/auth/login`, {
            // Enviamos el email y la contraseña en el body de la petición.
            // El body es la información que mandamos a la API.
            email: userEmail,
            password: userPassword,
        }).then((loginResponse) => {
            // loginResponse es la respuesta del endpoint /auth/login.
            // Comprobamos que el login ha ido bien antes de pedir el carrito.
            expect(loginResponse.status).to.eq(200)

            // La API devuelve este mensaje cuando las credenciales son correctas.
            expect(loginResponse.body.message).to.eq('Inicio de sesión exitoso')

            // El token debe existir, ser texto y no estar vacío.
            // Si no hubiera token, no podríamos demostrar que estamos autenticados.
            expect(loginResponse.body.token).to.be.a('string').and.not.be.empty

            // Guardamos el token en una constante para usarlo en la petición del carrito.
            // El token normalmente es un texto largo que identifica al usuario durante un tiempo.
            // Así la API sabe que somos el usuario logueado sin mandar email y password otra vez.
            const token = loginResponse.body.token

            // Ahora sí pedimos el carrito enviando el token en la cabecera Authorization.
            // Las headers o cabeceras son información extra que viaja con la petición.
            // No forman parte de la URL ni del body, pero la API las puede leer.
            //
            // Authorization es la cabecera estándar para mandar credenciales.
            // Bearer significa "portador": le estamos diciendo a la API
            // "te mando este token como prueba de que he iniciado sesión".
            //
            // Tiene que ir exactamente con este formato:
            // Authorization: Bearer TOKEN
            //
            // Por eso escribimos `Bearer ${token}`:
            // - Bearer es una palabra fija.
            // - ${token} mete dentro del texto el token que recibimos en el login.
            cy.api({
                method: 'GET',
                url: `${apiUrl}/cart`,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }).then((cartResponse) => {
                // cartResponse es la respuesta del endpoint /cart.
                // Si quitáramos la cabecera Authorization, la API respondería 401 Token requerido.
                // Como hemos mandado el token correctamente, esperamos un 200.

                // Si el token es correcto, el carrito debe responder con 200.
                expect(cartResponse.status).to.eq(200)

                // La API devuelve el carrito como un array.
                // Puede venir vacío, por ejemplo [], si el usuario no tiene productos.
                // Que venga vacío no significa que falle: significa que el carrito no tiene artículos.
                expect(cartResponse.body).to.be.an('array')

                // Comprobamos que Cypress ha medido tiempo de respuesta.
                expect(cartResponse.duration).to.be.greaterThan(0)
            })
        })
    })

})
