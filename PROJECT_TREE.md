# Proyecto COGNITIA - Árbol de Estructura

## Resumen General

```
COGNITIA/
├── .claude/                          # Configuración local Claude
├── .github/                          # Configuración GitHub y prompts
├── backend/                          # Backend TypeScript/Node
├── code/                            # Código adicional
├── docs/                            # Documentación
├── frontend/                        # Frontend Angular
├── openspec/                        # Especificaciones técnicas
└── README.md
```

---

## Backend (`backend/`)

```
backend/
├── .env.example                     # Variables de entorno ejemplo
├── package.json                     # Dependencias y scripts
└── src/
    ├── main.ts                      # Entry point principal
    ├── config/
    │   └── env.ts                   # Configuración de entorno
    ├── shared/
    │   ├── logger.ts                # Logger compartido
    │   └── types.ts                 # Tipos comunes
    └── modules/
        ├── index.ts                 # Agregador de módulos
        ├── auth/
        │   ├── auth.types.ts        # Interfaces de Auth
        │   ├── auth.service.ts      # Servicio de autenticación
        │   ├── auth.controller.ts   # Controlador Auth
        │   └── index.ts
        ├── patients/
        │   ├── patients.types.ts
        │   ├── patients.service.ts
        │   ├── patients.controller.ts
        │   └── index.ts
        ├── sessions/
        │   ├── sessions.types.ts
        │   ├── sessions.service.ts
        │   ├── sessions.controller.ts
        │   └── index.ts
        ├── results/
        │   ├── results.types.ts
        │   ├── results.service.ts
        │   ├── results.controller.ts
        │   └── index.ts
        ├── execution/
        │   ├── execution.types.ts
        │   ├── execution.service.ts
        │   ├── execution.controller.ts
        │   └── index.ts
        └── integrations/
            ├── index.ts
            └── unith/
                ├── unith.types.ts           # Tipos Unith
                ├── unith-client.interface.ts # Contrato
                ├── unith-client.mock.ts     # Implementación Mock
                ├── unith.service.ts         # Servicio Unith
                └── index.ts
```

---

## Frontend (`frontend/`)

```
frontend/
├── angular.json                     # Configuración Angular
├── package.json                     # Dependencias e scripts
├── tsconfig.json                    # Configuración TypeScript
├── assets/
│   └── stimuli/
│       ├── item-3.1-memory-visual/  # 4 imágenes
│       ├── item-3.4.1-number-interference/  # 49 imágenes (carta 1-1 a carta 7-7)
│       └── item-3.4.2-go-no-go/     # 88 imágenes (diapositiva1 a diapositiva88)
└── src/
    ├── app/
    │   ├── app-routing.module.ts    # Routing principal con lazy-load
    │   ├── app.module.ts            # Módulo principal
    │   ├── app.component.ts         # Componente raíz
    │   ├── app.component.html       # Template con navbar
    │   ├── app.component.css        # Estilos principal
    │   ├── core/                    # Servicios centralizados
    │   ├── shared/                  # Componentes/pipes compartidos
    │   └── features/                # Feature modules lazy-loaded
    │       ├── auth/
    │       │   ├── auth.module.ts
    │       │   ├── auth-routing.module.ts
    │       │   ├── components/
    │       │   │   ├── login.component.ts
    │       │   │   └── login.component.html
    │       │   └── services/
    │       │       └── auth.service.ts
    │       ├── patients/
    │       │   ├── patients.module.ts
    │       │   ├── patients-routing.module.ts
    │       │   ├── components/
    │       │   │   ├── list.component.ts
    │       │   │   └── list.component.html
    │       │   └── services/
    │       │       └── patients.service.ts
    │       ├── sessions/
    │       │   ├── sessions.module.ts
    │       │   ├── sessions-routing.module.ts
    │       │   ├── components/
    │       │   │   ├── list.component.ts
    │       │   │   └── list.component.html
    │       │   └── services/
    │       │       └── sessions.service.ts
    │       ├── execution/
    │       │   ├── execution.module.ts
    │       │   ├── execution-routing.module.ts
    │       │   ├── components/
    │       │   │   ├── execution.component.ts
    │       │   │   └── execution.component.html
    │       │   └── services/
    │       │       └── execution.service.ts
    │       └── results/
    │           ├── results.module.ts
    │           ├── results-routing.module.ts
    │           ├── components/
    │           │   ├── list.component.ts
    │           │   └── list.component.html
    │           └── services/
    │               └── results.service.ts
    └── environments/                # Configuración por entorno
```

---

## OpenSpec (`openspec/`)

Especificación técnica completa del proyecto dividida en secciones:

```
openspec/
├── AGENTS.md                        # Definición de agentes
├── config.yaml                      # Configuración de specs
├── archive/                         # Especificaciones archivadas
├── changes/                         # Cambios y revisiones
└── specs/
    ├── 00-meta/                     # Metadatos y ADRs
    │   ├── FILES_MAP.md
    │   ├── SPEC_INDEX.md
    │   └── ADR-001-system-scope.md
    ├── 01-context/                  # Contexto y visión
    │   ├── vision.md
    │   ├── business-goals.md
    │   ├── scope-in-out.md
    │   ├── actors-and-roles.md
    │   └── glossary.md
    ├── 02-architecture/             # Arquitectura del sistema
    │   ├── solution-overview.md
    │   ├── logical-architecture.md
    │   ├── module-map.md
    │   ├── sequence-session-lifecycle.md
    │   └── tech-stack.md
    ├── 03-product/                  # Especificaciones de producto
    │   ├── product-overview.md
    │   ├── user-journeys.md
    │   ├── user-stories.md
    │   ├── acceptance-criteria.md
    │   └── screens-and-navigation.md
    ├── 04-domain/                   # Modelo de dominio
    │   ├── bounded-contexts.md
    │   ├── domain-model.md
    │   ├── business-rules.md
    │   ├── session-state-machine.md
    │   ├── item-spec-3.1.md         # a 3.7.md
    │   ├── item-spec-3.2.md
    │   ├── item-spec-3.3.md
    │   ├── item-spec-3.4.1.md
    │   ├── item-spec-3.4.2.md
    │   ├── item-spec-3.5.md
    │   ├── item-spec-3.6.md
    │   └── item-spec-3.7.md
    ├── 05-backend/                  # Especificaciones backend
    │   ├── backend-overview.md
    │   ├── service-boundaries.md
    │   ├── api-conventions.md
    │   ├── api-endpoints.md
    │   ├── openapi.yaml
    │   ├── execution-engine.md
    │   ├── scoring-and-persistence.md
    │   └── security.md
    ├── 06-frontend/                 # Especificaciones frontend
    │   ├── frontend-overview.md
    │   ├── angular-architecture.md
    │   ├── routing-map.md
    │   ├── state-management.md
    │   ├── ui-modules.md
    │   └── ui-spec.md
    ├── 07-data/                     # Modelo de datos
    │   ├── data-model.md
    │   ├── data-dictionary.md
    │   ├── result-payloads.md
    │   ├── db-schema.sql
    │   └── retention-and-audit.md
    ├── 08-integrations/             # Integraciones externas
    │   ├── unith-integration.md
    │   ├── unith-events.md
    │   ├── asr-normalization.md
    │   └── error-handling.md
    ├── 09-quality/                  # Aseguramiento de calidad
    │   ├── non-functional-requirements.md
    │   ├── test-strategy.md
    │   ├── e2e-scenarios.md
    │   └── traceability-matrix.md
    ├── 10-delivery/                 # Entrega y despliegue
    │   ├── roadmap.md
    │   ├── environments.md
    │   ├── deployment.md
    │   └── handover-checklist.md
    └── diagrams/                    # Diagramas Mermaid
        ├── structure.mmd            # Estructura de archivos
        ├── system-context.mmd
        ├── session-lifecycle.mmd
        └── data-model.mmd
```

---

## Estructura General de Carpetas

| Carpeta | Propósito |
|---------|-----------|
| `.claude/` | Configuración local de Claude/prompts |
| `.github/` | Prompts y skills para GitHub |
| `backend/` | API REST y lógica de negocio (TypeScript) |
| `code/` | Código adicional o ejemplos |
| `docs/` | Documentación del proyecto |
| `frontend/` | Aplicación Angular SPA |
| `openspec/` | Especificaciones técnicas completas |

---

## Características Principales

### Backend
- ✅ Módulos: Auth, Patients, Sessions, Results, Execution
- ✅ Integración Unith (Mock)
- ✅ Configuración de entorno
- ✅ Logger compartido
- ✅ Tipado TypeScript

### Frontend
- ✅ 5 Feature Modules con lazy-loading
- ✅ Routing base configurado
- ✅ Componentes principales por módulo
- ✅ Servicios inyectables
- ✅ Assets para estímulos (161 imágenes)

### OpenSpec
- ✅ 67 archivos de especificación técnica
- ✅ Diagramas Mermaid
- ✅ Cobertura 00-10 de secciones
- ✅ ADRs y decisiones documentadas

---

Última actualización: 2026-04-09
