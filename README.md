# 🎓 EduFlow: La Nueva Era de la Gestión Pedagógica

EduFlow es una plataforma ecosistémica diseñada para cerrar la brecha entre la gestión administrativa escolar y el proceso de enseñanza-aprendizaje. Mediante el uso de **Inteligencia Artificial Proactiva**, transformamos datos crudos en información pedagógica valiosa.

## 🎯 Objetivos Estratégicos del Proyecto

1. **Eficiencia Temporal**: Reducir la carga administrativa del docente en un 30% mediante automatizaciones inteligentes.
2. **Empoderamiento con IA**: Proveer un asistente (EduAI) que sirva como multiplicador de la creatividad pedagógica.
3. **Analítica Humana**: Convertir el registro de asistencia y notas en indicadores de bienestar y progreso estudiantil.
4. **Barrera Cero**: Una interfaz tan intuitiva que cualquier docente pueda dominarla en minutos.

---

## 🚀 Pilares Tecnológicos

### 1. IA Generativa (EduAI)
Integración nativa con **Groq (Llama 3)** para generar contenidos pedagógicos en segundos.

### 2. Diseño UX Premium "Oceanic"
Interfaz dark mode de alta densidad con animaciones Framer Motion y diseño tipo Bento.

### 3. Biblioteca de Recursos con Cloud Storage
Los docentes pueden subir PDFs, documentos Word, imágenes y más. Los archivos se almacenan en **Vercel Blob Storage** (cloud permanente) y los alumnos los visualizan directamente en la plataforma con el visor integrado.

### 4. Arquitectura Robusta y Segura
Construido con **Next.js 16.2.4** y **MongoDB Atlas**, con foco en disponibilidad y seguridad para el manejo de datos sensibles de menores.

---

## 🛠️ Stack Completo

| Capa | Tecnología |
|---|---|
| **Frontend** | Next.js 16.2.4 (React 19), Tailwind CSS 4, Framer Motion |
| **Base de datos** | MongoDB Atlas via Mongoose |
| **Autenticación** | JWT + Cookies HttpOnly (jose) |
| **IA** | Llama-3-70b-versatile via Groq SDK |
| **File Storage** | Vercel Blob Storage |
| **Despliegue** | Vercel (con middleware edge) |

---

## 📁 Estructura de Rutas

### Docente (`/teacher/*`)
| Ruta | Descripción |
|---|---|
| `/teacher/dashboard` | Panel principal con métricas en tiempo real |
| `/teacher/students` | Gestión de alumnos y asistencia |
| `/teacher/lesson-plan` | Plan de clases anual |
| `/teacher/assignments` | Trabajos prácticos |
| `/teacher/grades` | Calificaciones |
| `/teacher/messages` | Mensajería |
| `/teacher/library` | **Biblioteca de recursos** (subida de archivos) |
| `/teacher/subjects` | Gestión de materias |

### Alumno (`/student/*`)
| Ruta | Descripción |
|---|---|
| `/student/dashboard` | Panel del estudiante |
| `/student/assignments` | Entregas y tareas |
| `/student/resources` | **Recursos del docente** (visualización de archivos) |
| `/student/grades` | Calificaciones y promedio |
| `/student/messages` | Mensajes |

---

## 🔑 Variables de Entorno

```env
# Base de datos
MONGODB_URI=mongodb+srv://...

# Autenticación
JWT_SECRET=...

# IA
GROQ_API_KEY=...

# Almacenamiento de archivos (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

---

## 📖 Documentación Adicional

- **Para Docentes**: [Manual de Usuario](./MANUAL_DOCENTE.md) 🍎
- **Seguridad**: [Security Implementation Guide](./SECURITY.md) 🛡️

---

*EduFlow - Inspirando mentes, optimizando tiempos.*
