# Tack

**Enfocá el trabajo. Medí el tiempo. Todo en local.**

Tack es una app de escritorio (Electron) para seguir tareas con cronómetro de alta frecuencia, objetivos en horas (`objetivoHoras`), tiempo acumulado persistido (`timeSpent`) y recordatorios de hidratación por tiempo — sin depender de la nube. Desarrollada en el ecosistema **HabitOS**.

---

## Qué hace

- **Productividad:** lista de tareas con color, postura (sentado / en movimiento) y meta en horas; barra y línea de progreso hacia el objetivo; no podés cambiar de tarea mientras hay sesión activa (timer en marcha o pausado con tiempo acumulado hasta **Stop**).
- **Navegación:** panel izquierdo con secciones (menú de bienvenida, productividad, hábitos y dashboard como vistas centrales) y animación de carrusel; modo pantalla completa desde el proceso principal.
- **Pausas:** overlay de almuerzo / estiramiento con temporizador; el cronómetro principal se pausa al iniciar una pausa.
- **Hidratación:** cuenta regresiva configurable (intervalo en `renderer/constants.js`); al confirmar se reinicia el plazo.
- **Datos:** lectura/escritura de `tack_db.json` vía IPC en el proceso principal (privacidad y portabilidad).

### Linux y sandbox de Electron

En muchas distribuciones el sandbox de Chromium falla sin configuración extra. El script `npm start` define `ELECTRON_DISABLE_SANDBOX=1` para poder abrir la ventana sin error. Para empaquetado, valorá [documentación oficial](https://www.electronjs.org/docs/latest/tutorial/sandbox) o políticas de tu entorno.

---

## Uso rápido (usuarios)

1. Instalá o descargá el binario para tu SO (p. ej. AppImage en Linux, portable en Windows) si publicás releases.
2. Ejecutá la app; el archivo `tack_db.json` se guarda junto al uso habitual del proyecto o según lo defina `main.js`.
3. Creá tareas, elegí una, **Start** / **Pause** / **Stop**; el tiempo se guarda al pausar y al detener.

---

## Desarrollo

### Requisitos

- Node.js y npm
- Electron (devDependency del proyecto)

### Comandos

```bash
npm install
npm start
```

Build de ejemplo (salida en `dist/`):

```bash
npm run dist:linux
npm run dist:win
```

### Estructura del renderer (módulos)

La lógica de interfaz no va en un único archivo: está partida en `renderer/` con **CommonJS** (`require` / `module.exports`), sin bundler, compatible con cómo Electron carga el HTML.

| Módulo | Rol |
|--------|-----|
| `bootstrap.js` | Entrada: enlaza IPC, expone funciones globales para `onclick` del HTML, `DOMContentLoaded`. |
| `state.js` | Estado mutable compartido (DB en memoria, cronómetro, modal, hidratación). |
| `constants.js` | Intervalo de hidratación e IDs/vistas del carrusel. |
| `db.js` | `loadDB` / `saveDB` vía `ipcRenderer`; hook `setAfterPersist` para refrescar UI. |
| `task-helpers.js` | Funciones puras: formato de duración, % hacia objetivo, etiquetas de postura. |
| `timer.js` | Cronómetro, `actualizarDisplay`, `controlTimer`, `sesionDeTareaEnCurso`. |
| `tasks.js` | Modal crear/editar/borrar, lista de tareas, `renderUI`. |
| `breaks.js` | Overlay de pausas. |
| `hydration.js` | UI y lógica del panel de hidratación. |
| `navigation.js` | Carrusel de secciones y sincronización con FX de menú/productividad. |
| `fx.js` | Canvas HUD (menú) y red de partículas (productividad), un solo loop `requestAnimationFrame`. |

El proceso principal sigue en `main.js` (ventana, fullscreen, rutas de DB).

---

## Créditos y licencia

- **Concepto:** HabitOS  
- **Desarrollo:** según `package.json` (`author` / `developer`)  
- **Licencia:** ISC (ver archivo de licencia del repositorio si existe).

---

*Pensado para sesiones largas, datos locales y una interfaz oscura y legible.*
