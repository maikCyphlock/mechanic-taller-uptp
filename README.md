# Gestión de Taller Mecánico

Sistema de gestión para talleres mecánicos. Permite administrar clientes, vehículos, órdenes de reparación y usuarios del sistema.

## ✨ Características Principales

*   **Gestión de Clientes:** Registrar, editar y consultar información de clientes.
*   **Gestión de Vehículos:** Registrar, editar y consultar información de vehículos asociados a los clientes.
*   **Gestión de Órdenes de Reparación (Tickets):**
    *   Creación de nuevas órdenes de reparación.
    *   Asignación de mecánicos a las órdenes.
    *   Seguimiento del estado de las reparaciones.
    *   Registro de servicios realizados y repuestos utilizados.
    *   Aprobación y edición de tickets.
*   **Gestión de Usuarios:** Diferentes roles de usuario (administrador, mecánico, cliente) con permisos específicos.
*   **Panel de Administración:** Interfaz para administrar usuarios, clientes, vehículos y configuraciones generales del sistema.
*   **Panel de Usuario:** Interfaz para que los clientes puedan ver el estado de sus reparaciones y su historial.
*   **Panel de Mecánico:** Interfaz para que los mecánicos puedan ver las órdenes asignadas y actualizar su estado.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:**
    *   [Astro](https://astro.build/): Framework web para construir sitios rápidos y optimizados.
    *   [Svelte](https://svelte.dev/): Compilador para construir interfaces de usuario reactivas.
*   **Backend:**
    *   [Astro API Routes](https://docs.astro.build/en/guides/endpoints/): Para la creación de la API REST.
    *   [TypeScript](https://www.typescriptlang.org/): Superset de JavaScript que añade tipado estático.
*   **Base de Datos:**
    *   [Drizzle ORM](https://orm.drizzle.team/): ORM para interactuar con la base de datos (PostgreSQL).
*   **Autenticación:**
    *   [Better Auth](https://github.com/LuciaAuth/better-auth) (utilizando `drizzleAdapter`).

## 📁 Estructura del Proyecto (Simplificada)

```text
/
├── public/                   # Archivos estáticos (imágenes, favicons, etc.)
├── src/
│   ├── components/           # Componentes Svelte reutilizables
│   ├── db/                   # Esquema de la base de datos (Drizzle)
│   ├── layout/               # Plantillas de diseño globales (Astro)
│   ├── lib/                  # Librerías y utilidades (autenticación, conexión a BD)
│   ├── pages/                # Páginas y rutas de la aplicación (Astro)
│   │   ├── admin/            # Rutas y vistas del panel de administración
│   │   ├── api/              # Endpoints de la API REST
│   │   ├── user/             # Rutas y vistas del panel de usuario
│   │   └── ...
│   ├── middleware.ts         # Middleware para la gestión de rutas y autenticación
├── drizzle/                  # Archivos de configuración y migraciones de Drizzle
├── package.json              # Dependencias y scripts del proyecto
├── astro.config.mjs          # Configuración de Astro
├── drizzle.config.ts         # Configuración de Drizzle ORM
└── tsconfig.json             # Configuración de TypeScript
```

## 🚀 Instalación y Puesta en Marcha

1.  **Clonar el repositorio:**
    ```bash
    git clone https://URL_DEL_REPOSITORIO_AQUI # Reemplazar con la URL real
    cd NOMBRE_DEL_DIRECTORIO_DEL_PROYECTO
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    *   Crear un archivo `.env` en la raíz del proyecto.
    *   Añadir las variables necesarias:
        *   `DATABASE_URL`: Cadena de conexión a la base de datos PostgreSQL.
        *   `AUTH_SECRET`: Secreto para la librería de autenticación (Better Auth).
    *   Consultar `env.d.ts` o el código fuente para otras variables requeridas.


4.  **Ejecutar las migraciones de la base de datos (si aplica):**
    ```bash
    npm run drizzle:push # O el comando específico para el motor de BD
    ```

5.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:4321` (o el puerto configurado).

## Available Scripts

Desde la raíz del proyecto:

| Comando                 | Acción                                                                 |
| :---------------------- | :--------------------------------------------------------------------- |
| `npm install`           | Instala las dependencias del proyecto.                                   |
| `npm run dev`           | Inicia el servidor de desarrollo local en `localhost:4321`.              |
| `npm run build`         | Compila la aplicación para producción en el directorio `./dist/`.        |
| `npm run preview`       | Previsualiza la compilación de producción localmente antes de desplegar. |
| `npm run astro ...`     | Ejecuta comandos de la CLI de Astro (ej: `astro add`, `astro check`).    |
| `npm run astro -- --help`| Obtiene ayuda sobre la CLI de Astro.                                   |
| `npm run drizzle:push`  | Aplica los cambios del esquema a la base de datos con Drizzle Kit.       |
| `npm run drizzle:studio`| Abre Drizzle Studio para explorar la base de datos.                      |


## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar este proyecto:

1.  Haz un Fork del repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y haz commit (`git commit -am 'Añade nueva funcionalidad'`).
4.  Empuja tus cambios a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request.

---

_Este README.md fue generado y adaptado para el proyecto de Gestión de Taller Mecánico._
