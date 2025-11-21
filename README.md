# AG Reader - Sistema de Lectura de Webcomics

Un lector de webcomics premium con sistema de lectura vertical panel por panel y soporte de audio inmersivo.

## 🚀 Inicio Rápido

### Opción 1: Usar el Sistema Directamente
1. Abre `start.html` en tu navegador para acceder al menú principal
2. Haz clic en "Abrir Reader" para comenzar a leer
3. Usa los controles en pantalla o atajos de teclado para navegar

### Opción 2: Configurar tu Propio Cómic
1. Abre `panel-definer.html` - Herramienta visual para definir paneles
2. Carga tu imagen de página
3. Dibuja rectángulos sobre los paneles
4. Copia el código generado a `script.js`
5. Agrega tus imágenes y audios
6. ¡Listo para leer!

## 📁 Archivos del Sistema

```
webcomic/
├── start.html          # 🏠 Página de inicio (COMIENZA AQUÍ)
├── index.html          # 📖 Reader principal
├── panel-definer.html  # 🎨 Herramienta para definir paneles
├── GUIDE.html          # 📚 Guía de uso completa
├── style.css           # 🎨 Estilos con glassmorphism
├── script.js           # ⚙️ Lógica del reader
├── README.md           # 📝 Este archivo
├── images/             # 🖼️ Páginas del cómic
│   ├── page1.png
│   └── page2.png
└── audio/              # 🎵 Archivos de audio
    └── README.txt
```

## 🎯 Características Principales

### 📖 4 Modos de Lectura

1. **Single Page** 📄
   - Lectura página por página tradicional
   - Ideal para cómics occidentales

2. **Double Page** 📖
   - Vista de dos páginas simultáneas
   - Perfecto para manga y lectura horizontal

3. **Cascade/Webtoon** 📜
   - Scroll vertical continuo
   - Estilo webtoon moderno

4. **Panel Focus Mode** 🎯 ⭐ **DESTACADO**
   - Lectura panel por panel inmersiva
   - Enfoque individual en cada viñeta
   - Navegación fluida entre paneles
   - Soporte de audio por panel

### 🎵 Sistema de Audio Inmersivo

- ✅ **Audio por viñeta**: Cada panel puede tener su propio archivo de audio
- ✅ **Indicador visual**: Animación cuando hay audio activo
- ✅ **Control global**: Toggle para activar/desactivar (botón o tecla 'M')
- ✅ **Reproducción automática**: Se reproduce al mostrar el panel
- ✅ **Gestión inteligente**: Audio se detiene al cambiar de panel

### 🎮 Controles Completos

#### ⌨️ Teclado
| Tecla | Acción |
|-------|--------|
| `←` `→` | Navegar entre paneles/páginas |
| `Espacio` | Siguiente panel/página |
| `M` | Toggle audio on/off |
| `ESC` | Salir del modo panel |

#### 📱 Touch/Móvil
- **Swipe izquierda** → Siguiente panel
- **Swipe derecha** → Panel anterior
- Soporte completo para gestos táctiles

#### 🖱️ Botones en Pantalla
- **Header**: Cambiar modo de lectura y toggle audio
- **Footer**: Navegación, zoom, y fullscreen
- **Progress bar**: Indicador visual de progreso

## �️ Herramienta Panel Definer

La herramienta **Panel Definer** (`panel-definer.html`) te permite definir paneles visualmente:

### Cómo Usar
1. Carga una imagen de tu página
2. Haz clic y arrastra para dibujar un rectángulo sobre el panel
3. Los valores se calculan automáticamente en porcentajes
4. Agrega información de audio si el panel lo tiene
5. Haz clic en "Agregar Panel"
6. Repite para cada panel de la página
7. Copia el código generado
8. Pégalo en `script.js` en la sección `comicData`

### Características del Panel Definer
- ✅ Interfaz visual drag & drop
- ✅ Cálculo automático de porcentajes
- ✅ Vista previa de paneles definidos
- ✅ Generación automática de código
- ✅ Soporte para audio por panel
- ✅ Copiar código al portapapeles

## ⚙️ Configuración de Paneles

### Estructura de Datos

En `script.js`, configura tus páginas y paneles:

```javascript
const comicData = [
    {
        page: 1,
        image: 'images/page1.png',
        panels: [
            {
                id: 'p1_panel1',
                crop: { x: 0, y: 0, width: 100, height: 50 },
                audio: 'audio/panel1_sound.mp3',
                hasAudio: true
            },
            {
                id: 'p1_panel2',
                crop: { x: 0, y: 50, width: 100, height: 50 },
                audio: null,
                hasAudio: false
            }
        ]
    },
    {
        page: 2,
        image: 'images/page2.png',
        panels: [
            {
                id: 'p2_panel1',
                crop: { x: 0, y: 0, width: 100, height: 33 },
                audio: 'audio/panel3_sound.mp3',
                hasAudio: true
            }
            // ... más paneles
        ]
    }
];
```

### Parámetros Explicados

**crop** (objeto):
- `x`: Posición horizontal inicial (0-100%)
- `y`: Posición vertical inicial (0-100%)
- `width`: Ancho del panel (0-100%)
- `height`: Alto del panel (0-100%)

**audio** (string o null):
- Ruta al archivo de audio
- `null` si no tiene audio

**hasAudio** (boolean):
- `true` si el panel tiene audio
- `false` si no tiene audio

## 🎨 Personalización

### Colores y Tema

Edita las variables CSS en `style.css`:

```css
:root {
    --bg-color: #0a0b10;           /* Fondo principal */
    --surface-color: #161b22;       /* Superficies */
    --primary-color: #00f2ff;       /* Color primario (cyan) */
    --secondary-color: #7000ff;     /* Color secundario (púrpura) */
    --text-color: #e6edf3;          /* Texto principal */
    --text-muted: #8b949e;          /* Texto secundario */
    --glass-bg: rgba(22, 27, 34, 0.7);  /* Fondo glassmorphism */
    --glass-border: rgba(255, 255, 255, 0.1);  /* Borde glass */
}
```

### Agregar Audio

1. Coloca tus archivos de audio en `audio/`
2. Formatos soportados: **MP3**, **WAV**, **OGG**
3. Recomendación: Archivos cortos (1-5 segundos)
4. Referencia el archivo en la configuración del panel

**Ejemplo de estructura:**
```
audio/
├── panel1_sound.mp3    (explosión)
├── panel2_ambient.mp3  (viento)
├── panel3_voice.mp3    (diálogo)
└── panel4_music.mp3    (música de fondo)
```

## 💡 Mejores Prácticas

### Para Panel Focus Mode
- ✅ Define paneles en orden de lectura (izquierda a derecha, arriba a abajo)
- ✅ Asegúrate de que los paneles no se superpongan
- ✅ Usa la herramienta Panel Definer para precisión
- ✅ Prueba la navegación antes de publicar

### Para Audio
- ✅ Usa efectos de sonido cortos y relevantes
- ✅ Normaliza el volumen de todos los audios
- ✅ Comprime archivos para carga rápida
- ✅ No uses audio en todos los paneles (puede ser abrumador)

### Para Imágenes
- ✅ Usa imágenes de alta calidad
- ✅ Formato recomendado: PNG o JPG
- ✅ Optimiza el tamaño de archivo
- ✅ Mantén proporciones consistentes

## 🔧 Requisitos Técnicos

- ✅ Navegador moderno (Chrome, Firefox, Safari, Edge)
- ✅ JavaScript habilitado
- ✅ Canvas API soportada
- ✅ Audio API soportada (para audio)
- ✅ No requiere servidor (funciona localmente)

## 📝 Notas Técnicas

### Tecnologías Utilizadas
- **Canvas API**: Para recortar paneles de imágenes completas
- **Web Audio API**: Para reproducción de audio
- **Touch Events**: Para gestos táctiles
- **CSS Grid/Flexbox**: Para layouts responsivos
- **CSS Custom Properties**: Para temas personalizables

### Optimizaciones
- ✅ Lazy loading de imágenes
- ✅ Audio bajo demanda
- ✅ Animaciones con GPU (transform, opacity)
- ✅ Debouncing en eventos de scroll
- ✅ Caché de canvas para paneles

## 🐛 Solución de Problemas

### El audio no se reproduce
- Verifica que el archivo existe en la ruta especificada
- Algunos navegadores requieren interacción del usuario primero
- Verifica que el formato de audio es compatible

### Los paneles no se muestran correctamente
- Verifica los valores de crop (deben sumar <= 100%)
- Usa la herramienta Panel Definer para precisión
- Verifica que la imagen existe

### La navegación no funciona
- Verifica que JavaScript está habilitado
- Abre la consola del navegador para ver errores
- Verifica que los datos están correctamente formateados

## � Recursos Adicionales

- **GUIDE.html**: Guía visual completa con ejemplos
- **panel-definer.html**: Herramienta interactiva
- **start.html**: Página de inicio con navegación

## 🎓 Tutoriales

### Tutorial 1: Crear tu Primer Cómic
1. Abre `panel-definer.html`
2. Carga `images/page1.png`
3. Define 2-3 paneles dibujando rectángulos
4. Copia el código generado
5. Pega en `script.js` reemplazando el ejemplo
6. Abre `index.html` y prueba

### Tutorial 2: Agregar Audio
1. Consigue un archivo de audio corto (MP3)
2. Colócalo en la carpeta `audio/`
3. En Panel Definer, marca "Este panel tiene audio"
4. Escribe la ruta: `audio/tu_archivo.mp3`
5. Genera el código y actualiza `script.js`
6. Prueba en el reader

## 🤝 Contribuciones

Este es un proyecto de código abierto. Siéntete libre de:
- Reportar bugs
- Sugerir nuevas características
- Mejorar la documentación
- Compartir tus cómics creados con este sistema

## 📄 Licencia

Este proyecto es de uso libre. Desarrollado con **Antigravity AI** ✨

---

## 🎉 ¡Comienza Ahora!

1. Abre `start.html` en tu navegador
2. Explora las diferentes secciones
3. Lee la guía completa en `GUIDE.html`
4. Usa `panel-definer.html` para crear tu cómic
5. ¡Disfruta leyendo!

**¿Preguntas?** Consulta `GUIDE.html` para documentación detallada.

---

**Desarrollado con Antigravity AI** ✨  
*Sistema profesional de lectura de webcomics*
