// CREAMOS ESTE MOCK, PARA DEVOLVER DE SER NECESARIO, VALORES A LLAMADOS A FUNCIONES QUE SE REALIZAR A LA LIBRERIA DE MAILGUN
// DE NO SER NECESARIO DEVOLVER NINGUN VALOR, SIMPLEMENTE DEVOLVEMOS EL LLAMADO A LA FUNCION VACIA.

const mailgun = () => {
    return {
        messages() {
            return {
                send() { }
            }
        }
    }
}

module.exports = mailgun
