# AGENTS.md — Reglas de Diseño, UX y Ejecución Técnica para Klaro

Este documento es de estricto cumplimiento para cualquier agente o modelo de IA que escriba código en este repositorio. Cualquier implementación que viole estas reglas será rechazada.

---

## 1. Filosofía de Diseño & Estética (Strict Minimalist Monochrome)
- **Paleta de Colores**:
  - Fondo base: Negro absoluto OLED (`#000000`).
  - Superficies elevadas sutiles: `#0D0D0D` o `#141414` máximo.
  - Tipografía y líneas estructurales: Blanco puro (`#FFFFFF`), Blanco tenue (`#8E8E93` o `#636366`), Bordes (`#1C1C1E`).
  - **PROHIBIDO**: Colores neón, degradados multicolores estridentes, Liquid Glass decorativo en botones, tarjetas o barras. Cero efectos de refracción innecesarios.
  - **Acentos de color**: Exclusivos para datos informativos (ej. progreso de fluido en metas, indicador positivo/negativo de saldo).
- **Tratamiento de UI**:
  - **Sin saturación de tarjetas (Anti-card clutter)**: Agrupa datos con listas limpias separadas por líneas de `StyleSheet.hairlineWidth` o espacio negativo, al estilo de la app Bolsa o Ajustes de Apple. No encapsules cada dato en una tarjeta flotante.
  - Esquinas: Usar siempre `borderCurve: 'continuous'` en bordes redondeados (`borderRadius: 16` a `24`).
  - Textos: Sobrios, directos y funcionales ("Agregar gasto", "Saldo actual", "Meta"). CERO textos publicitarios, introductorios o frases motivacionales ("¡Vamos por ese ahorro!").
- **Autenticación**:
  - **CERO login**: La app abre directamente en el dashboard en frío en < 200ms. Todo se persiste localmente.

---

## 2. Movimiento, Animaciones y Hápticos
- **Motor de Animación**: Usar exclusivamente `react-native-reanimated` v3+ en el UI Thread.
- **Física de Resortes de iOS**:
  - Taps y expansiones: `withSpring(value, { damping: 18, stiffness: 160, mass: 0.8 })`.
  - Círculo de meta (Fluid Fill): Animación fluida de nivel de líquido al acreditar fondos sin giroscopio ni vaivén por inclinación del dispositivo.
- **Hápticos (`expo-haptics`)**:
  - Clic de teclado numérico: `ImpactFeedbackStyle.Light`.
  - Registro completado / Guardar: `NotificationFeedbackType.Success`.
  - Deslizamiento o cambio de selección: `SelectionAsync`.

---

## 3. Estado, Carga y Manejo de Datos
- **Skeleton Loaders**: Cuando cualquier cálculo o lectura local demore más de 100ms, mostrar skeletons monocromáticos animados (`#1C1C1E` pulsando a `#2C2C2E`). No usar spinners de actividad genéricos circulares.
- **Offline First**: Persistencia síncrona/ultrarrápida con SQLite o MMKV local.
- **Navegación**: Exclusivamente `@react-navigation/native-stack` con títulos nativos grandes y `headerShadowVisible: false`.

---

## 4. Estándar de Código
- TypeScript en modo estricto. Prohibido el uso de `any`.
- Componentes funcionales pequeños con interfaces explícitas para props.
- No importar librerías pesadas no autorizadas en `ARCHITECTURE.md`.

## 5. Protocolo de Git & Commits
- **Frecuencia**: Realizar un commit únicamente al completar con éxito una tarea atómica de `TASK.md` y verificar que no existan errores de compilación (`npx tsc --noEmit`).
- **Formato**: Usar Conventional Commits en minúsculas y en español (o inglés conciso):
  - `feat(modulo): descripcion concisa`
  - `fix(modulo): correccion de error`
  - `refactor(modulo): mejora interna sin cambio de funcionalidad`
- **Archivos**: Nunca usar `git add .` a ciegas. Añadir únicamente los archivos involucrados en la tarea. Prohibido commitear archivos `.env`, `.DS_Store` o carpetas temporales.
- **Push**: Hacer `git push origin <rama>` solo al finalizar una **Fase completa** de `TASK.md` o cuando se solicite explícitamente, nunca por cada microtarea.