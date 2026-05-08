# 🍎 Guía de Usuario: EduFlow para Docentes

> "Transformando la educación a través de la tecnología humana e inteligente."

---

## 🌟 Nuestra Visión

En **EduFlow**, no solo construimos software; diseñamos puentes entre la pedagogía y la vanguardia tecnológica. Nuestra visión es empoderar a cada docente eliminando la carga administrativa repetitiva, permitiéndoles enfocarse en lo que realmente importa: **inspirar y guiar a sus alumnos.**

Creemos que la Inteligencia Artificial no debe reemplazar al docente, sino convertirse en su asistente más capaz, una extensión de su creatividad y conocimiento.

---

## 🎯 Objetivos de la Plataforma

1. **Reducción de la Carga Administrativa**: Automatizar tareas como el cálculo de asistencia y la organización de calendarios, devolviendo hasta un 30% de tiempo semanal al docente.
2. **Personalización del Aprendizaje**: Utilizar datos en tiempo real para que el docente sepa exactamente qué alumno necesita refuerzo antes de que sea tarde.
3. **Potenciación Creativa con IA**: Proveer un motor de generación de contenidos (EduAI) que sirva como "lluvia de ideas" constante para mantener las clases dinámicas y actualizadas.
4. **Accesibilidad y Simplicidad**: Mantener una interfaz premium pero intuitiva, que no requiera capacitación técnica avanzada para ser utilizada con éxito.

---

## 🚀 Navegación y Secciones

### 📂 1. Gestión Diaria
Es el corazón de tu jornada. Aquí controlas el presente de tu aula.
- **Panel Principal**: Tu resumen ejecutivo con métricas de asistencia y tareas.
- **Mis Alumnos**: Donde realizas el pase de lista y ves las fichas individuales.
- **Plan de Clases**: Tu cronograma semanal y anual con recursos adjuntos.
- **Trabajos Prácticos**: El repositorio de tareas enviadas y por corregir.

### 📊 2. Seguimiento y Análisis
Herramientas avanzadas para entender el progreso a largo plazo.
- **Calificaciones**: Libro de calificaciones digital con promedios automáticos.
- **Mensajería**: Canal directo para anuncios generales o mensajes privados.
- **Biblioteca**: Tu nube personal para compartir recursos con tus alumnos.

### 🛠️ 3. Soporte y Configuración
- **Manual de Usuario**: Acceso rápido a esta guía.
- **Ayuda Técnica**: Enlace para reportar errores o solicitar nuevas funciones.

---

## 📚 Biblioteca de Recursos (Nuevo)

La **Biblioteca** es tu espacio personal de almacenamiento en la nube. Podés subir archivos y tus alumnos los verán automáticamente en su sección "Recursos".

### ¿Cómo subir un archivo?

1. Ir a **Biblioteca** en el menú lateral
2. Hacer click en **"Subir Archivo"** (botón superior derecho)
3. En el modal:
   - **Arrastrar** el archivo al área marcada, o hacer click para seleccionarlo
   - Escribir un **título** descriptivo
   - Agregar una **descripción** opcional
4. Click en **"Publicar Recurso"**

El archivo queda disponible instantáneamente para todos los alumnos de la materia.

### Tipos de archivo soportados

| Tipo | Extensiones | Visualización |
|---|---|---|
| Documentos PDF | `.pdf` | Visor nativo inline |
| Word | `.docx`, `.doc` | Google Docs Viewer |
| Excel | `.xlsx`, `.xls` | Google Docs Viewer |
| Imágenes | `.jpg`, `.png`, `.gif` | Inline |
| Texto | `.txt` | Inline |
| Video | `.mp4` | Player inline |
| Audio | `.mp3` | Player inline |

**Límite máximo:** 20 MB por archivo.

### ¿Cómo eliminan un recurso?
Posicionarse sobre la card del archivo → hacer click en el ícono de **papelera** (aparece al pasar el cursor). El archivo se elimina del servidor automáticamente.

### ¿Qué ven los alumnos?
Los alumnos de tu materia activa ven todos los recursos publicados en su sección **"Recursos"** del menú lateral. Pueden visualizarlos sin descargarlos o descargarlos a su dispositivo.

---

## ✨ EduAI: Tu Co-Piloto Pedagógico

**EduAI** no es un bot de respuestas; es un **colaborador pedagógico** basado en Llama 3.

### ¿Cómo integrarlo en tu día a día?
- **Fase de Ideación**: ¿Te quedaste sin ideas para una clase? Pedile a EduAI una propuesta lúdica.
- **Fase de Estructuración**: Pedile que cree un TP completo con objetivos específicos.
- **Fase de Feedback**: Pedile una estructura de devolución constructiva para corregir trabajos.

---

## 🛡️ Seguridad y Privacidad

Sabemos que la información educativa es sensible.
- **Encriptación**: Todos los datos viajan de forma segura (HTTPS).
- **Almacenamiento**: Los archivos se guardan en **Vercel Blob Storage**, una infraestructura cloud de nivel enterprise.
- **Aislamiento**: Cada materia tiene su propio espacio. Los alumnos solo ven recursos de su materia.
- **Privacidad IA**: EduAI no "aprende" de tus datos personales ni de los de tus alumnos.

---

## ❓ Preguntas Frecuentes (FAQ)

- **¿Puedo usar EduFlow sin internet en el aula?**
  Necesitás conexión para sincronizar datos, pero una vez cargada la página podés trabajar con fluidez en redes lentas.

- **¿Cómo invito a mis alumnos?**
  Solo dales el **código de 6 letras** que aparece en la cabecera de tu panel. ¡Así de fácil!

- **¿Los archivos que subo persisten después de un deploy?**
  Sí. Los archivos se almacenan en Vercel Blob Storage (cloud), no en el servidor local, por lo que son permanentes.

- **¿Hay límite de archivos que puedo subir?**
  No hay límite en cantidad. El límite es de 5 GB de almacenamiento total en el plan gratuito de Vercel Blob.

- **¿Qué pasa si borro una materia?**
  Se eliminarán todos los alumnos y TPs asociados para proteger la privacidad. Los archivos de la Biblioteca deben eliminarse manualmente.

---

*EduFlow - Por una educación más humana, impulsada por la inteligencia.*
