/// <reference types="cypress" />

describe('Batería de pruebas de smoke sobre el login', () => {

    beforeEach(() => {
        cy.visit('https://footer-shop.vercel.app/login')
				cy.get('[href="https://footer-back.onrender.com/api/auth/google"]').should('be.visible').and('contain', ' Continuar con Google ')
    })

    it('ID:TC001 - Verificar boton iniciar sesion está desactivado hasta que usuario y password están rellenos', () => {
			cy.get('[routerlink="/forgot-password"]').should('have.attr','href',"/forgot-password").and('contain', '¿Olvidaste tu contraseña?')
			cy.get('[type="email"]').should('have.value', '')
			.should("have.attr","placeholder","tu.email@ejemplo.com")
			.and('have.value', '')
			cy.get('[formcontrolname="password"]').
			should("have.attr","placeholder","Introduce tu contraseña")
			.and('have.value', '')
			cy.get('[type="submit"]').should('be.disabled')

			cy.get('[type="email"]').type('cypress_bootcamp_2026@pablo.com').should('have.value', 'cypress_bootcamp_2026@pablo.com')
			cy.get('[type="submit"]').should('be.disabled')     

			cy.get('[type="email"]').clear().should('have.value', '')
			cy.get('[formcontrolname="password"]').type('123412P!').should('have.value', '123412P!')
			cy.get('[type="submit"]').should('be.disabled')    
    })

    it('ID:TC002 - login válido', () => {
			cy.get('[type="email"]').type('cypress_bootcamp_2026@pablo.com')
			cy.get('[formcontrolname="password"]').type('123412P!')
			cy.get('[aria-label="Ver perfil de usuario"').should('not.exist')
			cy.get('[aria-label="Cerrar sesión"]').should('not.exist')
			cy.get('[type="submit"]').should('be.enabled').click()
			cy.get('[aria-label="Ver perfil de usuario"').should('be.visible')
			cy.get('[aria-label="Cerrar sesión"]').should('be.visible')
			cy.get('app-toast').should('contain', 'Inicio de sesión exitoso')
			cy.get('app-toast', {timeout:20000}).should('not.be.visible')
		})

    it('ID:TC003 - usuario válido contraseña inválida', () => {
			cy.get('[type="email"]').type('cypress_bootcamp_2026@pablo.com')
			cy.get('[formcontrolname="password"]').type('invalid password.')
			cy.get('[type="submit"]').should('be.enabled').and('contain', ' Iniciar sesión ').click()
			cy.get('[type="submit"]').should('be.disabled').and('contain', 'Accediendo...')
			cy.get('app-toast').should('contain', 'Credenciales inválidas')
			cy.get('app-toast', {timeout:20000}).should('not.be.visible')
    })

		it('ID:TC004 - usuario inválido contraseña válida', () => {
			cy.get('[type="email"]').type('usuario_invalido@pablo.com')
			cy.get('[formcontrolname="password"]').type('123412P!')
			cy.get('[type="submit"]').should('be.enabled').and('contain', ' Iniciar sesión ').click()
			cy.get('[type="submit"]').should('be.disabled').and('contain', 'Accediendo...')
			cy.get('app-toast').should('contain', 'Credenciales inválidas')
			cy.get('app-toast', {timeout:20000}).should('not.be.visible')
    })
	
		it('ID:TC005 - Verificar visibilidad del campo contraseña', () => {
			cy.get('[aria-label="Toggle password visibility"]').should('be.visible');
			// cy.get('[type="email"]').type('usuario_invalido@pablo.com')
			cy.get('[formcontrolname="password"]').type('123412P!')
			cy.get('[formcontrolname="password"]').should('have.attr',"type", 'password')
			cy.get('[aria-label="Toggle password visibility"]').should('contain', 'visibility').click();
			cy.get('[formcontrolname="password"]').should('have.attr',"type", 'text')
			cy.get('[aria-label="Toggle password visibility"]').should('contain', 'visibility_off').click();
			cy.get('[aria-label="Toggle password visibility"]').should('contain', 'visibility')
			cy.get('[formcontrolname="password"]').should('have.attr',"type", 'password')
    })

		it('ID:TC006 - Verificar redireccion a la pagina de he olvidado mi contraseña', () => {
			cy.get('body').should('not.contain', 'Recuperar Contraseña')
			cy.get('[name="email"]').should('not.exist')
			cy.contains('[type="submit"]', 'Enviar Enlace').should('not.exist')
			cy.get('[routerlink="/forgot-password"]').click()
			cy.get('body').should('contain', 'Recuperar Contraseña')
			cy.get('[name="email"]').should('be.visible').and('have.attr', 'placeholder', 'Introduce tu dirección de email')
			cy.contains('[type="submit"]', 'Enviar Enlace').should('be.visible')
    })

})