# ARCHITECTURE.md — Estructura del Sistema y Componentes de Klaro

## 1. Estructura de Carpetas

```text
src/
├── components/
│   ├── common/
│   │   ├── Skeleton.tsx          # Componente base de carga esquelética monocromática
│   │   ├── NumberPad.tsx         # Teclado numérico minimalista háptico
│   │   └── Header.tsx            # Header sobrio con soporte de Large Title
│   ├── dashboard/
│   │   ├── BalanceDisplay.tsx    # Saldo actual y métrica Safe to Spend
│   │   ├── QuickActions.tsx      # Pull down / acceso rápido de registro
│   │   └── TransactionRow.tsx    # Fila de gasto/ingreso con línea divisoria fina
│   ├── subscriptions/
│   │   ├── SubRow.tsx            # Fila de suscripción con fecha de corte
│   │   └── SubLeakMetric.tsx     # Visor de fuga anual/mensual
│   └── goals/
│       ├── CircleFluidGoal.tsx   # Círculo con llenado fluido sin físicas de acelerómetro
│       └── GoalRow.tsx           # Metas abiertas o con monto
├── hooks/
│   ├── useHaptics.ts             # Wrapper para llamadas a expo-haptics
│   ├── useBiometrics.ts          # Integración de Face ID con LocalAuthentication
│   └── useTransactions.ts        # Hooks de react-query / state machine local
├── navigation/
│   ├── RootNavigator.tsx         # Native Stack Navigator (iOS)
│   └── types.ts                  # Tipos de rutas tipadas de React Navigation
├── screens/
│   ├── HomeScreen.tsx            # Vista principal con scroll de gastos y saldo
│   ├── AddTransactionModal.tsx   # Modal de registro rápido (Pull down o tap)
│   ├── MetricsScreen.tsx         # Desglose semanal y mensual interactivo
│   ├── SubscriptionsScreen.tsx   # Lista de cobros recurrentes y avisos
│   └── GoalsScreen.tsx           # Vista de metas de ahorro y progreso de fluido
├── services/
│   ├── db/
│   │   ├── client.ts             # Instancia de SQLite / Storage local
│   │   ├── schema.ts             # Definición de tablas
│   │   └── repository.ts         # Consultas CRUD optimizadas
│   └── notifications.ts          # Notificaciones push locales nativas
├── types/
│   └── index.ts                  # Modelos de datos TypeScript (Transaction, Goal, Sub)
└── utils/
    ├── currency.ts               # Formateador de moneda sobrio
    └── dates.ts                  # Utilidades de fechas para cortes semanales/mensuales