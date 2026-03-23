# 📌 Tack | RPG Productivity
App de escritorio construida con **Electron** para maximizar el enfoque mediante mecánicas RPG.

### ✨ Características
* **Sistema de Niveles:** Gana XP mientras trabajas.
* **Full Focus Mode:** Interfaz inmersiva para cero distracciones.
* **Estética High-End:** Interfaz oscura con detalles orgánicos.
* **Multi-Color:** Personaliza tus tareas con identidades visuales únicas.

🛠️ Stack Tecnológico
Backend: Python 3.x, Flask (Blueprints).

Base de Datos: SQLite con SQLAlchemy (ORM).

Frontend: HTML5, CSS3 (Minimalist Dark Theme), JavaScript (Vanilla).

Visualización: Chart.js.

### 🚀 Instalación
1. `npm install`
2. `npm start`

🎮 Mecánica de Juego
El motor de XP calcula el tiempo real transcurrido entre los eventos de inicio y fin registrados en la base de datos.

La fórmula aplicada es: XP = (segundos transcurridos / 60) * 10.

Si logras completar una sesión de trabajo de 10 minutos, alcanzarás los 100 XP necesarios para realizar un Level Up. La lógica está diseñada para ser adictiva y recompensar el trabajo profundo o "Deep Work".

Desarrollado con ❤️ UleashedBeast