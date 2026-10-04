---

### 3. `TASK.md`

```markdown
# TASK.md — Contrato de Ejecución de Klaro (iOS)

## Estado Actual: Inicialización de Proyecto
- Modo: Vibe coding autónomo supervisado.
- Criterio de parada: Cada tarea debe compilar con 0 errores de TypeScript (`npx tsc --noEmit`).

---

## Fase 1: Arquitectura Base y Capa de Datos Local
- [x] **Task 1.1**: Configurar TypeScript estricto y aliases de carpetas en `tsconfig.json`.
- [x] **Task 1.2**: Implementar el esquema de base de datos local y repositorios CRUD en `src/services/db/`.
- [x] **Task 1.3**: Crear tipos TypeScript de `Transaction`, `Subscription`, `Goal` en `src/types/index.ts`.
- [x] **Task 1.4**: Crear el componente `Skeleton.tsx` monocromático para estados de carga.
- [x] **Verificación Fase 1**: Ejecutar `npx tsc --noEmit` y verificar persistencia local de prueba.

---

## Fase 2: Navegación y Dashboard Monocromático
- [ ] **Task 2.1**: Configurar `RootNavigator.tsx` con `@react-navigation/native-stack` con estilo minimalista negro (`backgroundColor: '#000000'`).
- [ ] **Task 2.2**: Construir `HomeScreen.tsx` sin saturación de tarjetas:
  - Saldo en tipografía grande blanca.
  - Indicador sutil de "Safe to Spend" diario.
  - Lista de transacciones recientes separada por líneas finas (`hairlineWidth`).
- [ ] **Task 2.3**: Implementar gesto "Pull down to Add" para abrir el modal de captura rápida.
- [ ] **Verificación Fase 2**: Correr en simulador iOS, validar navegación y fluidez de scroll.

---

## Fase 3: Teclado Háptico y Registro Rápido
- [ ] **Task 3.1**: Crear `NumberPad.tsx` con respuesta háptica instantánea (`expo-haptics`).
- [ ] **Task 3.2**: Construir `AddTransactionModal.tsx` como modal nativo de iOS (`presentation: 'formSheet'`).
- [ ] **Task 3.3**: Lógica de "Redondeo sugerido" al guardar un gasto para destinarlo a metas.
- [ ] **Verificación Fase 3**: Registrar un gasto en < 3 toques y validar feedback háptico.

---

## Fase 4: Suscripciones y Recordatorios Locales
- [ ] **Task 4.1**: Crear `SubscriptionsScreen.tsx` con listado limpio y cálculo de "Fuga mensual/anual".
- [ ] **Task 4.2**: Programar notificaciones locales 24h antes del cobro con `expo-notifications`.
- [ ] **Task 4.3**: Toggle rápido para activar/desactivar y simular impacto en el presupuesto.
- [ ] **Verificación Fase 4**: Validar disparo de notificación programada en entorno de pruebas.

---

## Fase 5: Metas con Llenado de Fluido Circular
- [ ] **Task 5.1**: Desarrollar `CircleFluidGoal.tsx` animando la altura del fluido con `react-native-reanimated` al ingresar dinero (sin físicas de inclinación).
- [ ] **Task 5.2**: Implementar soporte para metas sin monto (seguimiento de rachas y fechas).
- [ ] **Task 5.3**: Pantalla `GoalsScreen.tsx` con lista limpia de metas activas.
- [ ] **Verificación Fase 5**: Visualizar animación fluida a 120 FPS al añadir fondos a una meta.

---

## Fase 6: Métricas, Face ID y Cierre
- [ ] **Task 6.1**: Construir `MetricsScreen.tsx` con selector semanal/mensual austero sin gráficas saturadas.
- [ ] **Task 6.2**: Integrar bloqueo con Face ID opcional usando `expo-local-authentication`.
- [ ] **Task 6.3**: Auditoría de rendimiento: eliminar dependencias sobrantes, verificar que no haya textos decorativos y validar arranque instantáneo.