# Proyecto COGNITIA - Árbol de Estructura (Actualizado)

## Resumen General

```
COGNITIA/
├── .claude/                          # Configuración local Claude
├── .github/                          # Configuración GitHub y prompts
├── backend/                          # Backend TypeScript/Node - ✅ Configurado
├── code/                            # Código adicional
├── docs/                            # Documentación
├── frontend/                        # Frontend Angular 17 - ✅ LISTO PARA DESARROLLO
├── openspec/                        # Especificaciones técnicas - ✅ 67 archivos
└── README.md
```

---

## Backend (`backend/`) - Status: ✅ Configurado

Stack: TypeScript/Node.js con arquitectura modular

```
backend/
├── .env.example                     # Variables de entorno ejemplo
├── package.json                     # Dependencias y scripts
└── src/
    ├── main.ts                      # Entry point - carga y reporta módulos
    ├── config/
    │   └── env.ts                   # Gestión de variables de entorno
    ├── shared/
    │   ├── logger.ts                # Servicio de logging
    │   └── types.ts                 # Interfaces compartidas
    └── modules/                     # 6 módulos de negocio
        ├── index.ts                 # Factory y agregador
        ├── auth/
        │   ├── auth.types.ts        # LoginInput, AuthToken
        │   ├── auth.service.ts      # login(), me()
        │   ├── auth.controller.ts   # API endpoints facade
        │   └── index.ts
        ├── patients/
        │   ├── patients.types.ts    # Patient interface
        │   ├── patients.service.ts  # list(), create()
        │   ├── patients.controller.ts
        │   └── index.ts
        ├── sessions/
        │   ├── sessions.types.ts    # Session con estado
        │   ├── sessions.service.ts  # CRUD + status tracking
        │   ├── sessions.controller.ts
        │   └── index.ts
        ├── results/
        │   ├── results.types.ts     # Score, metadata
        │   ├── results.service.ts   # Persistencia de resultados
        │   ├── results.controller.ts
        │   └── index.ts
        ├── execution/
        │   ├── execution.types.ts   # Task queue
        │   ├── execution.service.ts # Encolado y ejecución
        │   ├── execution.controller.ts
        │   └── index.ts
        └── integrations/
            └── unith/
                ├── unith.types.ts
                ├── unith-client.interface.ts  # Contrato
                ├── unith-client.mock.ts       # MockUnithClient (modo:"mock")
                ├── unith.service.ts
                └── index.ts
```

**Build Status:** ✅ Bootstrap configurado - logs de inicialización funcionales

**Próximos pasos:**
```bash
cd backend
npm install
npm start  # Carga env, instancia módulos, reporta estado
```

---

## Frontend (`frontend/`) - Status: ✅ **LISTO PARA DESARROLLO**

Stack: Angular 17 + TypeScript + RxJS

### Archivos de Configuración Completados:
```
frontend/
├── angular.json                    # Configuración CLI Angular (builders, assets, styles)
├── package.json                    # 954 paquetes instalados (Angular 17 + DevTools)
├── tsconfig.json                   # Configuración TypeScript strict + decorators
├── tsconfig.app.json              # Config para compilación de app
├── tsconfig.spec.json             # Config para pruebas unitarias
├── .gitignore                      # Reglas estándar de Git
├── karma.conf.js (opcional)        # Configuración de test runner
│
├── src/
│   ├── index.html                  # Template raíz - carga app-root
│   ├── main.ts                     # Bootstrap - platformBrowserDynamic()
│   ├── styles.css                  # Estilos globales
│   │
│   ├── app/
│   │   ├── app.module.ts           # NgModule raíz (declarations, imports, bootstrap)
│   │   ├── app-routing.module.ts   # Routing con 5 feature modules lazy-load
│   │   ├── app.component.ts        # AppComponent - navbar + router-outlet
│   │   ├── app.component.html      # Navbar con links /auth /patients /sessions /execution /results
│   │   ├── app.component.css       # Estilos navbar
│   │   │
│   │   └── features/               # 5 Feature modules independientes
│   │       │
│   │       ├── auth/
│   │       │   ├── auth.module.ts
│   │       │   ├── auth-routing.module.ts
│   │       │   ├── components/
│   │       │   │   ├── login.component.ts      # Formulario login
│   │       │   │   ├── login.component.html    # Email + password fields
│   │       │   │   └── login.component.css     # ✅ Estilos formulario
│   │       │   └── services/
│   │       │       └── auth.service.ts         # login(), me()
│   │       │
│   │       ├── patients/
│   │       │   ├── patients.module.ts
│   │       │   ├── patients-routing.module.ts
│   │       │   ├── components/
│   │       │   │   ├── list.component.ts       # Tabla de pacientes
│   │       │   │   ├── list.component.html     # Tabla dinámica
│   │       │   │   └── list.component.css      # ✅ Estilos tabla
│   │       │   └── services/
│   │       │       └── patients.service.ts
│   │       │
│   │       ├── sessions/
│   │       │   ├── sessions.module.ts
│   │       │   ├── sessions-routing.module.ts
│   │       │   ├── components/
│   │       │   │   ├── list.component.ts       # Tabla sesiones con estado
│   │       │   │   ├── list.component.html
│   │       │   │   └── list.component.css      # ✅ Estilos tabla
│   │       │   └── services/
│   │       │       └── sessions.service.ts
│   │       │
│   │       ├── results/
│   │       │   ├── results.module.ts
│   │       │   ├── results-routing.module.ts
│   │       │   ├── components/
│   │       │   │   ├── list.component.ts       # Tabla resultados con scores
│   │       │   │   ├── list.component.html
│   │       │   │   └── list.component.css      # ✅ Estilos tabla con colores
│   │       │   └── services/
│   │       │       └── results.service.ts
│   │       │
│   │       ├── execution/
│   │       │   ├── execution.module.ts
│   │       │   ├── execution-routing.module.ts
│   │       │   ├── components/
│   │       │   │   ├── execution.component.ts   # Controles start/stop
│   │       │   │   ├── execution.component.html
│   │       │   │   └── execution.component.css  # ✅ Estilos botones + spinner
│   │       │   └── services/
│   │       │       └── execution.service.ts
│   │       │
│   │       └── results/
│   │           └── ... (estructura idéntica)
│   │
│   └── assets/
│       ├── favicon.ico              # Icono de aplicación
│       └── stimuli/                 # Estímulos para tests cognitivos
│           ├── item-3.1-memory-visual/      # 4 imágenes
│           ├── item-3.4.1-number-interference/ # 49 imágenes (carta_1-1 a carta_7-7)
│           └── item-3.4.2-go-no-go/         # 88 imágenes (diapositiva_1 a diapositiva_88)
│
└── node_modules/                   # 954 paquetes instalados
    ├── @angular/* (core, compiler, platform-browser, etc)
    ├── @angular-devkit/* (build tools)
    ├── rxjs (reactive programming)
    └── ... (devDependencies: typescript, jasmine, karma, etc)
```

### Build Status: ✅ **COMPILACIÓN EXITOSA**

**Resultado del build (ng build):**
```
Initial Chunks:
✓ main.1dace99faa409755.js      232.02 kB (63.33 kB gzipped)
✓ polyfills.e8f8d5407c1a7036.js  33.99 kB (11.10 kB gzipped)
✓ runtime.9e0451ce62d83781.js    2.73 kB (1.32 kB gzipped)
✓ styles.e804cae82bcf14d1.css    244 bytes (160 bytes gzipped)

Lazy-loaded Feature Chunks:
✓ features-auth-auth-module                    26.61 kB (6.21 kB)
✓ features-execution-execution-module           3.17 kB (1.01 kB)
✓ features-sessions-sessions-module             2.82 kB (957 bytes)
✓ features-results-results-module               2.53 kB (890 bytes)
✓ features-patients-patients-module             2.52 kB (877 bytes)

Total Initial: 268.97 kB (75.90 kB transfer)
Build Time: 10.9 segundos ✅
```

### Arquitectura de Frontend:

1. **Bootstrap:** `main.ts` → `platformBrowserDynamic()` → `AppModule` → `AppComponent`
2. **Root Layout:** AppComponent con navbar y `<router-outlet>`
3. **Routing:** AppRoutingModule define 5 rutas lazy-load (auth, patients, sessions, execution, results)
4. **Feature Modules:** Cada feature es un módulo independiente con su propio routing y servicios
5. **Styling:** Component scoping (CSS por componente) + global styles.css
6. **Services:** `AuthService`, `PatientsService`, `SessionsService`, `ResultsService`, `ExecutionService`

### Comandos Disponibles:

```bash
# Desarrollo
npm start                              # Inicia dev server en http://localhost:4200
ng serve --open                       # Equivalente con abrir navegador

# Build
npm run build                         # Production build en dist/cognitia
ng build                              # Equivalente

# Testing
npm test                              # Ejecuta pruebas unitarias con Karma
ng test                               # Equivalente

# Generación de código
ng generate component path/to/component
ng generate service path/to/service
ng generate module path/to/module --routing
```

### Próx Pasos Desarrollo:

1. **Conectar Backend:** Actualizar `AuthService`, `PatientsService` para llamar API real
2. **Implementar Forms:** Agregar tipos de formulario (Reactive o Template-driven)
3. **State Management:** Considerar NgRx o Akita para manejo centralizado (opcional)
4. **Testing:** Escribir tests unitarios para servicios y componentes
5. **Deployment:** Configurar dist/ para servir en Vercel, Netlify, o servidor propio

---

## OpenSpec (`openspec/`) - Status: ✅ 67 archivos completados

Especificación técnica profesional dividida en 11 categorías:

```
openspec/
├── AGENTS.md                        # Definición de agentes de IA
├── config.yaml                      # Configuración de especificaciones
│
├── specs/                           # 67 archivos .md organizados
│   ├── 00-meta/                     # Metadatos y Architectural Decision Records
│   │   ├── FILES_MAP.md
│   │   ├── SPEC_INDEX.md
│   │   └── ADR-*.md (Architecture Decision Records)
│   │
│   ├── 01-context/                  # Contexto, visión y alcance (5 specs)
│   │   ├── vision.md (Visión del proyecto)
│   │   ├── business-goals.md (Objetivos de negocio)
│   │   ├── scope-in-out.md (Qué entra/sale del alcance)
│   │   ├── actors-and-roles.md (Actores del sistema)
│   │   └── glossary.md (Glosario técnico)
│   │
│   ├── 02-architecture/             # Arquitectura del sistema (5 specs)
│   │   ├── solution-overview.md
│   │   ├── logical-architecture.md
│   │   ├── module-map.md
│   │   ├── sequence-session-lifecycle.md
│   │   └── tech-stack.md (Decidido: Backend TS/Node, Frontend Angular, BD TBD)
│   │
│   ├── 03-product/                  # Especificaciones de producto (5 specs)
│   │   ├── product-overview.md
│   │   ├── user-journeys.md
│   │   ├── user-stories.md
│   │   ├── acceptance-criteria.md
│   │   └── screens-and-navigation.md
│   │
│   ├── 04-domain/                   # Modelo de dominio (15 specs)
│   │   ├── bounded-contexts.md
│   │   ├── domain-model.md
│   │   ├── business-rules.md
│   │   ├── session-state-machine.md (Estados: scheduled → in-progress → completed)
│   │   ├── item-spec-3.1.md through 3.7.md (7 items de evaluación)
│   │   │   └── [Links a 161 PNG images en assets/stimuli/]
│   │   │       - item-3.1: 4 imágenes (memoria visual)
│   │   │       - item-3.4.1: 49 imágenes (interferencia numérica)
│   │   │       - item-3.4.2: 88 imágenes (go-no-go)
│   │   └── ...
│   │
│   ├── 05-backend/                  # Especificaciones backend (8 specs)
│   │   ├── backend-overview.md
│   │   ├── service-boundaries.md (Auth, Patients, Sessions, Results, Execution)
│   │   ├── api-conventions.md
│   │   ├── api-endpoints.md
│   │   ├── openapi.yaml (OpenAPI 3.0 schema)
│   │   ├── execution-engine.md
│   │   ├── scoring-and-persistence.md
│   │   └── security.md (Auth, RBAC, session management)
│   │
│   ├── 06-frontend/                 # Especificaciones frontend (6 specs)
│   │   ├── frontend-overview.md (Angular 17 + TypeScript)
│   │   ├── angular-architecture.md (Feature modules, routing, services)
│   │   ├── routing-map.md (Lazy-load strategy)
│   │   ├── state-management.md (RxJS services, NgRx optional)
│   │   ├── ui-modules.md (Auth, Patients, Sessions, Results, Execution)
│   │   └── ui-spec.md (Color scheme, layout, responsive design)
│   │
│   ├── 07-data/                     # Modelo de datos (5 specs)
│   │   ├── data-model.md
│   │   ├── database-schema.md (TBD: SQL o NoSQL)
│   │   ├── data-relationships.md
│   │   ├── aggregates.md
│   │   └── migrations.md
│   │
│   ├── 08-integration/              # Integración externa (4 specs)
│   │   ├── integration-overview.md
│   │   ├── unith-integration.md (Actualmente: mockUnithClient)
│   │   ├── third-party-apis.md
│   │   └── webhooks-and-events.md
│   │
│   ├── 09-deployment/               # Deployment y DevOps (5 specs)
│   │   ├── deployment-strategy.md
│   │   ├── ci-cd-pipeline.md
│   │   ├── monitoring-and-logging.md
│   │   ├── performance-optimization.md
│   │   └── rollback-strategy.md
│   │
│   └── 10-delivery/                 # Entrega y operaciones (4 specs)
│       ├── delivery-process.md
│       ├── release-management.md
│       ├── support-and-maintenance.md
│       └── compliance-and-audit.md
│
├── changes/                         # Control de cambios
│   └── archive/
│
└── archive/                         # Especificaciones archivadas
```

**Mermaid Diagrams incluidos:**
- `structure.mmd` - Diagrama de arquitectura global
- `system-context.mmd` - Diagrama de contexto del sistema
- `session-lifecycle.mmd` - Máquina de estados de sesiones
- `data-model.mmd` - Modelo de datos ER

---

## Resumen del Proyecto

| Componente | Status | Tecnología | Notas |
|-----------|--------|-----------|-------|
| **Backend** | ✅ Scaffolding | TypeScript/Node.js | 6 módulos + integración Unith |
| **Frontend** | ✅ Listo | Angular 17 | 5 feature modules, 954 packages, compilado |
| **OpenSpec** | ✅ Completo | Markdown + Mermaid | 67 archivos en 11 categorías |
| **Assets** | ✅ Completo | PNG images | 161 estímulos para tests cognitivos |
| **Configuración** | ✅ Completo | YAML/JSON | Env, build, lint configurados |

---

## Próximos Pasos Inmediatos

### 1. Backend (Opcional)
```bash
cd backend
npm install
npm start
```

### 2. Frontend (Listo para desarrollo)
```bash
cd frontend
npm start  # Abre http://localhost:4200 automáticamente
```

### 3. Integración Backend-Frontend
Actualizar `src/app/features/*/services/*.ts` para conectar con endpoints reales

### 4. Base de Datos
Definir y crear esquema (SQL o NoSQL) según docs en `openspec/specs/07-data/`

---

## Fecha de Generación
Proyecto scaffolded y configurado completamente el 09/04/2026

**Nota:** Este árbol está actualizado a fecha de generación. Será actualizado conforme se agregue código.
