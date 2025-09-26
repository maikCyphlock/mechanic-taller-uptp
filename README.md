# Gestión de Taller Mecánico - Next.js + tRPC

Sistema de gestión para talleres mecánicos construido con Next.js, tRPC, Drizzle ORM y NextAuth.js.

## ✨ Características Principales

- **Gestión de Tickets:** Sistema completo de tickets con estados y asignaciones
- **Gestión de Usuarios:** Autenticación y autorización con roles
- **Gestión de Clientes:** CRUD completo de clientes
- **Gestión de Vehículos:** Registro y seguimiento de vehículos
- **Panel de Administración:** Interface completa para administradores
- **Type Safety:** Completamente tipado con TypeScript y tRPC
- **Base de Datos:** PostgreSQL con Drizzle ORM
- **UI Moderna:** Componentes con Radix UI y Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** tRPC, NextAuth.js
- **Base de Datos:** PostgreSQL con Drizzle ORM
- **UI:** Tailwind CSS, Radix UI, Lucide Icons
- **Validación:** Zod
- **Estado:** TanStack Query (React Query)

## 🚀 Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus valores:
   - `DATABASE_URL`: URL de conexión a PostgreSQL
   - `NEXTAUTH_SECRET`: Secreto para NextAuth.js
   - `NEXTAUTH_URL`: URL de tu aplicación

3. **Configurar la base de datos:**
   ```bash
   npm run db:push
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── ui/             # Componentes base de UI
│   └── layout/         # Componentes de layout
├── pages/              # Páginas de Next.js
│   ├── api/            # API routes
│   ├── auth/           # Páginas de autenticación
│   ├── admin/          # Panel de administración
│   └── user/           # Panel de usuario
├── server/             # Código del servidor
│   ├── api/            # Routers de tRPC
│   ├── db/             # Configuración de base de datos
│   └── auth.ts         # Configuración de NextAuth
├── styles/             # Estilos globales
└── utils/              # Utilidades y configuración de tRPC
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run start` - Servidor de producción
- `npm run db:push` - Aplicar cambios del schema a la BD
- `npm run db:studio` - Abrir Drizzle Studio
- `npm run db:generate` - Generar migraciones

## 🔐 Autenticación y Autorización

El sistema utiliza NextAuth.js con los siguientes roles:
- **admin:** Acceso completo al sistema
- **user:** Mecánicos con acceso a tickets asignados
- **CLIENTE:** Clientes con acceso limitado

## 📊 Base de Datos

El schema incluye las siguientes entidades principales:
- **Users:** Usuarios del sistema con roles
- **Clients:** Clientes del taller
- **Vehicles:** Vehículos de los clientes
- **Tickets:** Órdenes de trabajo/reparación
- **Roles:** Definición de roles y permisos

## 🎯 Funcionalidades Principales

### Para Administradores
- Gestión completa de usuarios
- Supervisión de todos los tickets
- Gestión de clientes y vehículos
- Aprobación de trabajos completados

### Para Mecánicos
- Ver tickets asignados
- Actualizar estado de trabajos
- Registrar tiempo y materiales utilizados
- Cerrar tickets completados

### Para Clientes
- Ver estado de sus vehículos
- Historial de servicios
- Crear nuevas solicitudes

## 🚀 Despliegue

Para desplegar en producción:

1. **Build de la aplicación:**
   ```bash
   npm run build
   ```

2. **Configurar variables de entorno de producción**

3. **Desplegar en tu plataforma preferida** (Vercel, Railway, etc.)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork del repositorio
2. Crear una rama para tu feature
3. Commit de tus cambios
4. Push a la rama
5. Crear un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.