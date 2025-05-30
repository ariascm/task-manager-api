# 📋 Task Manager API

Una API RESTful construida con **Node.js**, **Express** y **MongoDB** que permite a los usuarios gestionar sus tareas. Incluye funcionalidades de autenticación, carga de archivos y envío de correos electrónicos.

---

## 🚀 Funcionalidades

- Registro e inicio de sesión de usuarios con JWT
- Subida de avatar del usuario (perfil)
- Creación, edición y eliminación de tareas
- Filtrado, paginación y ordenamiento de tareas
- Middleware de autenticación
- Emails de bienvenida y despedida

---

## 🛠️ Tecnologías utilizadas

- Node.js
- Express
- MongoDB con Mongoose
- JSON Web Tokens (JWT)
- Multer (carga de archivos)
- Mailgun (envío de emails)
- Jest y Supertest (pruebas)

---

## 📦 Instalación

- git clone https://github.com/usuario/task-manager-api.git
- cd task-manager-api
- npm install

## ▶️ Cómo correr la app
- npm run start

Para desarrollo con autoreload:
- npm run dev

## 🧪 Cómo correr los tests
- npm run test

## 📂 Estructura del proyecto
    src/
    ├── app.js            # Configuración principal de Express
    ├── index.js          # Punto de entrada
    ├── db/               # Conexión a MongoDB
    ├── models/           # Modelos de usuario y tarea
    ├── routers/          # Rutas de usuario y tareas
    ├── middleware/       # Middleware de autenticación
    ├── emails/           # Configuración de Mailgun
    tests/                # Pruebas automáticas

## 👤 Autor
    Cristian Arias
    GitHub - @ariascm