# ERP ODO — Sistema Odontológico

Monorepo del sistema de gestión odontológica.

## Estructura

```
odo/
├── odo-frontend/   # React Native + Expo
└── odo-backend/    # Java Spring Boot (próximamente)
```

## Stack

- **Frontend:** React Native + Expo SDK 55
- **Backend:** Java Spring Boot
- **Base de datos:** PostgreSQL + JPA
- **Auth:** JWT + Spring Security

## Ramas (Git Flow)

| Rama | Propósito |
|------|-----------|
| `main` | Producción estable |
| `dev` | Integración continua |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Correcciones |
| `release/*` | Preparación de versiones |
