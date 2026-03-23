⏱️ Tack
High-End Productivity Framework for Developers.

Tack es una aplicación de escritorio diseñada para gestionar flujos de trabajo profundo (Deep Focus) y salud biomecánica. Desarrollada en Electron, se enfoca en una estética minimalista y un control preciso del tiempo sin distracciones.

🛠️ Características Principales
Deep Focus Engine: Cronómetro de alta precisión con indicadores visuales de estado de flujo.

Bio-Sync Alerts: Sistema de alertas inteligentes para estiramiento (cada 50 min) y recordatorios de hidratación.

Gestión de Tareas: Creación y selección de tareas con persistencia de datos local.

Focus Mode: Interfaz inmersiva en pantalla completa para eliminar distracciones del sistema operativo.

Persistencia Local: Almacenamiento automático en tack_db.json dentro del directorio del programa.

🎨 Estética (High-End Design)
La interfaz utiliza una paleta Deep Dark (#050505) con tipografía Inter y paneles de bajo contraste para reducir la fatiga visual durante largas jornadas de programación.

🚀 Instalación y Uso
Clonar el repositorio:
git clone https://github.com/tu-usuario/tack.git
cd tack

Instalar dependencias:
npm install

Iniciar la aplicación:
npm start

📂 Estructura del Proyecto
main.js: Control del proceso principal de Electron y manejo del sistema de archivos.

index.html: Estructura de la interfaz de usuario.

style.css: Motor de diseño y animaciones Bio-Sync.

render.js: Lógica del cronómetro, gestión de estados y biometría.

tack_db.json: Base de datos local (generada automáticamente).

🛡️ Notas de Desarrollo
Este proyecto utiliza un archivo JSON local para la persistencia. Asegúrate de que tack_db.json esté incluido en tu .gitignore para evitar subir datos personales o registros de sesión al repositorio público.

Desarrollado con enfoque en la ergonomía y la productividad orgánica.