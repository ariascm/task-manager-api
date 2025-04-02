// https://jestjs.io/docs/expect

const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add } = require('../src/math')


test('Calculate total with the tip', () => expect(calculateTip(10, .3)).toBe(13))

//el valor default en la funcion asigna el 0.25 al tip
test('Calculate total with the default tip', () => expect(calculateTip(10)).toBe(12.5))

test('Fahrenheit to Celsius conversion', () => expect(fahrenheitToCelsius(32)).toBe(0))

test('Celsius to Fahrenheit', () => expect(celsiusToFahrenheit(0)).toBe(32))

// TESTING ASYNCHRONUS

// //agregamos done (puede ser cualquier palabra) como parametro para que jest lo vea, y no de por pasada la prueba, hasta que DONE sea llamado
// // sino estará dando por PASADA la prueba, salteando el contenido de la funcion asincrona.
// test('Async test demo', (done) => {
//     setTimeout(() => {
//         expect(1).toBe(2)
//         done()
//     }, 2000)

// })

// testing a function que retorna una PROMESA, debo usar el parametro DONE para que jest espere por llamada al parametro luego del resultado de la promesa
test('Should add two numbers', (done) => {
    add(2, 3).then((sum) => {
        expect(sum).toBe(5)
        done()
    })
})

// Testing with ASYNC/AWAIT -> this always return a promise, JEST will be waiting for the promise. "Done" is not necessary here
test('Should add two numbers async/await', async () => {
    const sum = await add(10, 13)
    expect(sum).toBe(23)
})