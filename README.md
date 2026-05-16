# ODO — Sistema de Gestión Odontológica

ERP completo para clínicas dentales. Gestiona pacientes, citas, odontograma, facturación con cuotas, catálogo de tratamientos y panel de administración con auditoría completa.

---

## Stack tecnológico

### Backend
| Elemento | Detalle |
|---|---|
| Framework | **Spring Boot 4.0.6** |
| Lenguaje | **Java 21** |
| Seguridad | Spring Security 6 + JWT HS256 (24 h) |
| ORM | Spring Data JPA / Hibernate 7 |
| Base de datos | PostgreSQL 16 |
| Build | Maven 3.9 |
| Contenedor | Docker — `eclipse-temurin:21-jre-alpine` |

### Frontend
| Elemento | Detalle |
|---|---|
| Framework | **React Native 0.83.6** |
| SDK | **Expo 55** |
| Navegación | React Navigation v7 (Native Stack + Bottom Tabs) |
| HTTP | Axios 1.x (interceptor global de auth y errores) |
| Persistencia | AsyncStorage |
| Plataformas | Android · iOS · Web (responsive) |

---

## Estructura del repositorio

```
odo/
├── docker-compose.yml              # PostgreSQL + backend en un comando
├── odo-backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/odo/odo_backend/
│       ├── config/
│       │   ├── DataInitializer.java     # Seed: admin@odo.com / Admin123!
│       │   └── SecurityConfig.java      # CORS + JWT filter + roles
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── UserController.java      # /api/admin/users
│       │   ├── ProfileController.java   # /api/profile
│       │   ├── PatientController.java   # /api/patients
│       │   ├── AppointmentController.java
│       │   ├── InvoiceController.java   # /api/invoices
│       │   ├── TreatmentController.java # /api/treatments + /api/admin/treatments
│       │   └── AuditLogController.java  # /api/admin/audit-logs
│       ├── dto/
│       │   ├── request/                 # LoginRequest, UserRequest, InvoiceRequest…
│       │   └── response/                # AuthResponse, UserResponse, InvoiceResponse…
│       ├── exception/
│       │   ├── GlobalExceptionHandler.java
│       │   ├── ResourceNotFoundException.java
│       │   └── UnauthorizedException.java
│       ├── model/
│       │   ├── User.java                # roles: ADMIN, DENTIST, RECEPTIONIST, PATIENT
│       │   ├── Patient.java
│       │   ├── Appointment.java
│       │   ├── Odontogram.java / ToothRecord.java
│       │   ├── Invoice.java             # estados: PENDING, PARTIAL, PAID, CANCELLED
│       │   ├── InvoicePayment.java      # pagos individuales por factura
│       │   ├── Treatment.java
│       │   └── AuditLog.java            # historial de acciones
│       ├── repository/                  # Spring Data JPA repositories
│       ├── security/
│       │   ├── JwtUtil.java             # genera y valida tokens
│       │   ├── JwtFilter.java           # intercepta cada request
│       │   └── UserDetailsServiceImpl.java
│       └── service/                     # lógica de negocio
└── odo-frontend/
    ├── App.js
    └── src/
        ├── components/
        │   ├── common/                  # Skeleton, SkeletonRow
        │   ├── forms/                   # FormInput, SectionTitle
        │   └── layout/                  # Sidebar (desktop)
        ├── constants/
        │   ├── api.js                   # BASE_URL + todos los endpoints
        │   └── theme.js                 # colores, sombras
        ├── context/
        │   ├── AuthContext.js           # user, token, login, logout, updateUser
        │   └── ThemeContext.js          # dark/light mode
        ├── navigation/
        │   ├── AppNavigator.js          # raíz: auth vs main
        │   ├── AuthNavigator.js         # login
        │   └── MainNavigator.js         # tabs + sidebar + stacks
        ├── screens/
        │   ├── auth/LoginScreen.js
        │   ├── dashboard/DashboardScreen.js
        │   ├── profile/ProfileScreen.js
        │   ├── patients/                # lista, detalle, formulario
        │   ├── appointments/            # lista, formulario
        │   ├── odontogram/OdontogramScreen.js
        │   ├── billing/
        │   │   ├── InvoiceListScreen.js # lista, pago, historial
        │   │   └── InvoiceFormScreen.js # crear factura + cuotas
        │   └── admin/
        │       ├── AdminScreen.js       # usuarios + acceso a herramientas
        │       ├── UserFormScreen.js    # crear/editar usuario
        │       ├── TreatmentScreen.js   # catálogo CRUD
        │       └── AuditLogScreen.js    # historial paginado
        ├── services/
        │   ├── api.js                   # axios + interceptores
        │   ├── authService.js
        │   ├── patientService.js
        │   ├── appointmentService.js
        │   ├── invoiceService.js
        │   ├── treatmentService.js
        │   ├── profileService.js
        │   └── adminService.js
        └── utils/responsive.js          # useBreakpoint (mobile/tablet/desktop)
```

---

## Levantar el proyecto

### Con Docker (recomendado — PostgreSQL + backend)

```bash
# Desde la raíz del monorepo
docker-compose up --build
```

- **PostgreSQL** disponible en `localhost:5432`
- **Backend API** disponible en `http://localhost:8080`

### Backend local (sin Docker)

Requisitos: Java 21, Maven 3.9, PostgreSQL corriendo.

```bash
cd odo-backend
mvn spring-boot:run
```

### Frontend

```bash
cd odo-frontend
npm install
npx expo start
```

Abrir en dispositivo con la app **Expo Go**, o en navegador presionando `w`.

> Ajustar la URL del backend en `odo-frontend/src/constants/api.js` → `API_BASE_URL`

---

## Configuración

### Variables de entorno del backend

| Variable | Default (desarrollo) | Descripción |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/odo_db` | URL de la base de datos |
| `SPRING_DATASOURCE_USERNAME` | `odo_user` | Usuario PostgreSQL |
| `SPRING_DATASOURCE_PASSWORD` | `odo_password` | Contraseña PostgreSQL |
| `JWT_SECRET` | *(clave de 256 bits en el archivo)* | Secreto para firmar tokens |
| `JWT_EXPIRATION` | `86400000` | Expiración del token en ms (24 h) |

### Usuario inicial (seed automático)

Al arrancar por primera vez el backend crea:

| Campo | Valor |
|---|---|
| Email | `admin@odo.com` |
| Contraseña | `Admin123!` |
| Rol | `ADMIN` |

---

## Roles y permisos

Todos los roles pueden iniciar sesión con email y contraseña. El token JWT expira a las **24 horas**.

### ADMIN
- Gestión completa de **usuarios** (crear, editar, activar/desactivar cualquier rol)
- Gestión completa de **tratamientos** (crear, editar, activar/desactivar, eliminar)
- Ver, crear y **eliminar facturas**
- Registrar pagos en facturas
- Ver el **registro de auditoría** (solo lectura — nadie puede editar ni eliminar logs)
- Acceso completo a todos los demás módulos
- Ver y editar su propio perfil

### DENTIST
- Ver y gestionar **pacientes** (crear, editar, ver odontograma)
- Ver y gestionar **citas**
- Ver y crear **facturas**, registrar pagos (incluyendo cuotas)
- Ver su propio **perfil** y cambiar contraseña
- **Sin acceso** al panel de administración ni auditoría

### RECEPTIONIST
- Ver y gestionar **pacientes**
- Ver y gestionar **citas**
- Ver y crear **facturas**, registrar pagos
- Ver su propio **perfil**
- **Sin acceso** al panel de administración ni auditoría

### PATIENT
- Inicia sesión en el sistema
- Ver y editar su propio **perfil** (nombre, email, contraseña)
- **Sin acceso** a ningún otro módulo

---

## API REST — Endpoints

### Autenticación
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Login → devuelve JWT + datos del usuario |

### Perfil (usuario autenticado)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/profile` | Autenticado | Ver mi perfil |
| PUT | `/api/profile` | Autenticado | Editar nombre, email y/o contraseña |

### Pacientes
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/patients` | Autenticado | Listar todos |
| GET | `/api/patients/{id}` | Autenticado | Ver uno |
| POST | `/api/patients` | Autenticado | Crear |
| PUT | `/api/patients/{id}` | Autenticado | Editar |
| DELETE | `/api/patients/{id}` | Autenticado | Eliminar |

### Citas
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/appointments` | Autenticado | Listar todas |
| GET | `/api/appointments/{id}` | Autenticado | Ver una |
| GET | `/api/appointments/patient/{id}` | Autenticado | Por paciente |
| POST | `/api/appointments` | Autenticado | Crear |
| PUT | `/api/appointments/{id}` | Autenticado | Editar |
| DELETE | `/api/appointments/{id}` | Autenticado | Eliminar |

### Odontograma
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/odontogram/{patientId}` | Autenticado | Ver odontograma |
| PUT | `/api/odontogram/{patientId}/tooth/{num}` | Autenticado | Actualizar diente |

### Facturación
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/invoices` | Autenticado | Listar todas |
| GET | `/api/invoices/{id}` | Autenticado | Ver una (incluye pagos) |
| GET | `/api/invoices/patient/{id}` | Autenticado | Por paciente |
| POST | `/api/invoices` | Autenticado | Crear factura |
| POST | `/api/invoices/{id}/payments` | Autenticado | Registrar pago |
| PATCH | `/api/invoices/{id}/cancel` | Autenticado | Anular factura |
| DELETE | `/api/invoices/{id}` | **ADMIN** | Eliminar factura |

### Tratamientos
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/treatments` | Autenticado | Listar activos (para el formulario) |
| GET | `/api/admin/treatments` | **ADMIN** | Listar todos (incluso inactivos) |
| POST | `/api/admin/treatments` | **ADMIN** | Crear |
| PUT | `/api/admin/treatments/{id}` | **ADMIN** | Editar |
| PATCH | `/api/admin/treatments/{id}/toggle-active` | **ADMIN** | Activar/desactivar |
| DELETE | `/api/admin/treatments/{id}` | **ADMIN** | Eliminar |

### Usuarios (Admin)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/admin/users` | **ADMIN** | Listar todos |
| GET | `/api/admin/users/{id}` | **ADMIN** | Ver uno |
| POST | `/api/admin/users` | **ADMIN** | Crear usuario |
| PUT | `/api/admin/users/{id}` | **ADMIN** | Editar usuario |
| PATCH | `/api/admin/users/{id}/toggle-active` | **ADMIN** | Activar/desactivar |

### Auditoría
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/admin/audit-logs` | **ADMIN** | Historial paginado (solo lectura) |

Parámetros opcionales: `?userId=&action=LOGIN&page=0&size=50`

---

## Módulos del sistema

### Autenticación
- Login con email y contraseña
- Token JWT con expiración de 24 horas
- Cierre de sesión limpia estado en memoria y AsyncStorage
- Cada login queda registrado en auditoría con IP y dispositivo

### Dashboard
- Resumen de actividad del día
- Acceso rápido al perfil del usuario

### Pacientes
- CRUD completo con búsqueda
- Vista de detalle con historial de citas
- Acceso al odontograma desde el detalle

### Odontograma
- 32 dientes, 5 superficies cada uno
- Estados: `HEALTHY`, `CAVITY`, `FILLED`, `EXTRACTED`, `CROWN`, `ROOT_CANAL`, `IMPLANT`
- Notas por diente

### Agenda / Citas
- Crear y editar citas con fecha, hora, paciente y dentista
- Vista de calendario semanal con scroll horizontal
- Cancelar citas

### Facturación
- Crear factura asociada a un paciente con descripción de tratamientos
- **Pago en cuotas**: al crear se define el número de cuotas; el sistema calcula el monto sugerido por cuota
- Registrar pagos parciales con notas; el estado cambia automáticamente:
  - `PENDING` → primer pago → `PARTIAL` → pago completo → `PAID`
- Anular factura (`CANCELLED`)
- Ver historial completo de pagos por factura
- Solo ADMIN puede eliminar facturas permanentemente

### Catálogo de Tratamientos
- Nombre, descripción, precio base, duración en minutos
- Activar/desactivar (no eliminar los que ya tienen facturas asociadas)
- Eliminación permanente con confirmación
- Los tratamientos activos aparecen disponibles al crear facturas

### Panel de Administración
- **Usuarios**: crear, editar y activar/desactivar de cualquier rol
- **Tratamientos**: acceso rápido al catálogo
- **Auditoría**: acceso rápido al historial

### Perfil
- Disponible para todos los roles
- Editar nombre y correo electrónico
- Cambiar contraseña (requiere contraseña actual)
- Ver y ocultar contraseña con botón de ojo
- Botón de cerrar sesión

### Registro de Auditoría
Cada acción importante se registra automáticamente:

| Acción | Cuándo se registra |
|---|---|
| `LOGIN` | Inicio de sesión exitoso |
| `CREATE` | Creación de cualquier entidad |
| `UPDATE` | Edición de cualquier entidad |
| `DELETE` | Eliminación de cualquier entidad |
| `PAYMENT_REGISTERED` | Pago parcial o total de factura |
| `STATUS_CHANGED` | Cambio de estado (cita, factura) |

Cada registro incluye: usuario, rol, IP, User-Agent y timestamp.

> El log es **solo lectura**. No existe ningún endpoint para crear, editar ni eliminar registros.

---

## Layout responsivo

| Ancho de pantalla | Modo |
|---|---|
| < 768 px | Bottom tabs (móvil) |
| 768 – 1023 px | Sidebar colapsado (tablet) |
| ≥ 1024 px | Sidebar expandido (desktop) |

---

## CORS

El backend acepta peticiones desde cualquier origen (`allowedOriginPatterns: *`) con todos los métodos HTTP. Para producción reemplazar `*` por el dominio específico en `SecurityConfig.java`.

---

## Git Flow

| Rama | Propósito |
|---|---|
| `main` | Producción estable |
| `dev` | Integración continua |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Correcciones |
| `release/*` | Preparación de versiones |
