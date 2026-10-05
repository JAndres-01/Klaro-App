### 3. `TASK.md`

```markdown
# TASK.md — Contrato de Ejecución de Klaro (iOS)

## Estado de Ejecución
- Modo: Vibe coding autónomo supervisado.
- Requisito de paso: Toda tarea debe pasar verificación con `npx tsc --noEmit` antes de hacer commit.

---

## Fase 1: Arquitectura Base y Capa de Datos Local
- [x] **Task 1.1**: Configurar TypeScript estricto y aliases de carpetas en `tsconfig.json`.
- [x] **Task 1.2**: Implementar el esquema de base de datos local y repositorios CRUD en `src/services/db/` contemplando `BalanceAccount`, `Transaction` con `balanceId` y `Subscription`.
- [x] **Task 1.3**: Declarar tipos TypeScript consolidados en `src/types/index.ts`.
- [x] **Task 1.4**: Crear el componente `Skeleton.tsx` monocromático para estados de carga.
- [x] **Verificación Fase 1**: Ejecutar `npx tsc --noEmit` y validar consultas en frío.

---

## Fase 2: Navegación y Pantalla Principal
- [x] **Task 2.1**: Configurar `RootNavigator.tsx` con `@react-navigation/native-stack` con fondo negro puro (`#000000`).
- [x] **Task 2.2**: Estructurar `HomeScreen.tsx` con scroll nativo, cabecera austera y listado sin tarjetas.
- [x] **Task 2.3**: Conectar fila de cobros próximos de suscripciones en la pantalla de inicio.
- [x] **Verificación Fase 2**: Correr en simulador iOS y verificar transiciones de pantalla nativas.

---

## Fase 2.5: Refactor Carrusel de Saldos (Estilo Revolut)
- [ ] **Task 2.5.1**: Actualizar `src/services/db/` para soportar saldos múltiples y filtrado de transacciones por `balanceId`.
- [ ] **Task 2.5.2**: Crear `BalanceCarousel.tsx` y `ReactiveBackground.tsx` usando Reanimated para interpolar el fondo con el `accentColor` del saldo visible.
- [ ] **Task 2.5.3**: Crear `BalancePaginationPill.tsx` con dots interactivos y conectar la apertura de `AllBalancesModal.tsx` en presentación `formSheet`.
- [ ] **Task 2.5.4**: Conectar el carrusel con la lista de movimientos para que muestre exclusivamente los ingresos y retiros de la cuenta seleccionada.
- [ ] **Verificación Fase 2.5**: Comprobar scroll horizontal a 120 FPS sin caídas de frames y verificar con `npx tsc --noEmit`.

---

## Fase 3: Teclado Háptico y Registro Rápido
- [x] **Task 3.1**: Crear `NumberPad.tsx` con respuesta háptica instantánea (`expo-haptics`) en cada dígito.
- [ ] **Task 3.2**: Construir `AddTransactionModal.tsx` con selector de tipo (Gasto / Ingreso) asignado por defecto al saldo activo.
- [ ] **Task 3.3**: Implementar gesto "Pull down to Quick Add" en `HomeScreen.tsx`.
- [ ] **Task 3.4**: Añadir selector de redondeo opcional para derivar el sobrante a un saldo tipo meta.
- [ ] **Verificación Fase 3**: Registrar un gasto en < 3 segundos desde la apertura y comprobar hápticos.

---

## Fase 4: Suscripciones y Recordatorios Locales
- [ ] **Task 4.1**: Crear `SubscriptionsScreen.tsx` accesible desde la fila de cobros próximos con cálculo de fuga mensual y anual (`SubLeakMetric.tsx`).
- [ ] **Task 4.2**: Implementar programación de alertas locales 24h/48h antes del corte usando `expo-notifications`.
- [ ] **Task 4.3**: Permitir pausar o activar suscripciones con recálculo dinámico de la fuga proyectada.
- [ ] **Verificación Fase 4**: Programar una notificación de prueba en entorno local y verificar cálculo de fuga.

---

## Fase 5: Fluid Fill en Cuentas tipo Meta
- [ ] **Task 5.1**: Desarrollar `CircleFluidGoal.tsx` animando la altura del fluido con `react-native-reanimated` al recibir fondos (sin acelerómetro).
- [ ] **Task 5.2**: Integrar el círculo de fluido dentro del detalle de saldos que tengan `targetAmount` establecido.
- [ ] **Task 5.3**: Habilitar en `CreateBalanceModal.tsx` la creación de saldos estándar o metas de ahorro con asignación de `accentColor`.
- [ ] **Verificación Fase 5**: Simular un abono y verificar la animación de ascenso del fluido.

---

## Fase 6: Métricas, Face ID y Optimización Final
- [ ] **Task 6.1**: Implementar `MetricsScreen.tsx` con análisis semanal y mensual sobrio sin gráficos saturados.
- [ ] **Task 6.2**: Integrar bloqueo con Face ID opcional mediante `expo-local-authentication`.
- [ ] **Task 6.3**: Auditoría de rendimiento: eliminar dependencias innecesarias, asegurar `borderCurve: 'continuous'` global y arranque en frío < 200 ms.
- [ ] **Verificación Fase 6**: Build de producción y prueba de ejecución fluida en dispositivo físico.