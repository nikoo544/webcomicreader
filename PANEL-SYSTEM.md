# Panel Focus Mode - Scroll-Triggered Audio System

## 🎯 Cómo Funciona

El sistema de paneles ahora funciona de DOS maneras:

### 1. **Modo Panel Focus** (Pantalla Completa)
- Muestra UN panel a la vez en pantalla completa
- Navega con botones o flechas del teclado
- Reproduce audio cuando el panel tiene audio configurado

### 2. **Modo Cascade con Marcadores** (NUEVO)
- Muestra toda la página en scroll vertical
- Los paneles están marcados con bordes azules semi-transparentes
- Cuando haces scroll y un panel entra en vista:
  - ✅ El borde se ilumina (azul brillante)
  - ✅ Aparece la etiqueta del panel
  - ✅ Se reproduce el audio automáticamente (si tiene)
- Los audios solo se reproducen UNA VEZ por panel

## 📝 Configuración de Paneles

```javascript
const comicData = [
    {
        page: 1,
        image: 'images/page1.png',
        panels: [
            {
                id: 'panel1',
                crop: { x: 2.1, y: 0.6, width: 95.7, height: 9.4 },
                audio: null,  // Sin audio
                hasAudio: false
            },
            {
                id: 'panel2',
                crop: { x: 3.6, y: 43, width: 92.1, height: 11 },
                audio: 'audio/panel2_sound.mp3',  // CON audio
                hasAudio: true
            }
        ]
    }
];
```

## 🎨 Características del Sistema

### Marcadores Visuales
- **Borde Tenue**: Panel fuera de vista (rgba(0, 242, 255, 0.3))
- **Borde Brillante**: Panel activo en vista (rgba(0, 242, 255, 0.8))
- **Etiqueta**: Muestra el ID del panel cuando está activo

### Detección de Scroll
- Usa **Intersection Observer API** para detectar paneles
- Se activa cuando el panel está al 50% visible
- Margen de activación: 20% del viewport (evita activaciones prematuras)

### Audio Automático
- Se reproduce cuando el panel entra en vista
- Solo se reproduce UNA VEZ (no se repite si vuelves a hacer scroll)
- Respeta el estado del botón de audio (mute/unmute)
- Muestra el indicador de audio animado

## 🔧 Personalización

### Ajustar Sensibilidad de Activación
En `setupScrollDetection()`:
```javascript
const options = {
    rootMargin: '-20% 0px -20% 0px',  // Cambiar estos valores
    threshold: [0, 0.5, 1.0]           // 0.5 = 50% visible
};
```

### Ocultar Marcadores Visuales
En `addPanelMarkers()`:
```javascript
marker.style.border = 'none';  // Sin borde
label.style.display = 'none';  // Sin etiqueta
```

### Cambiar Colores
```javascript
// Borde inactivo
marker.style.border = '2px solid rgba(TU_COLOR, 0.3)';

// Borde activo
marker.style.border = '3px solid rgba(TU_COLOR, 0.8)';
```

## 🎮 Controles

- **Scroll**: Navega por el cómic
- **M**: Toggle audio on/off
- **Botones de modo**: Cambia entre Single/Double/Cascade/Panel

## 🐛 Debug

Abre la consola (F12) para ver:
- `📍 Panel activated: panel1` - Panel entró en vista
- `🔊 Playing audio for panel2: audio/panel2_sound.mp3` - Audio reproduciéndose
- `🎯 Observing 3 panel markers` - Cantidad de paneles detectados

## 💡 Recomendaciones

1. **Para cómics con paneles delgados**: Usa Modo Cascade
2. **Para cómics con paneles grandes**: Usa Modo Panel Focus
3. **Audio**: Coloca archivos .mp3 o .wav en la carpeta `audio/`
4. **Definir paneles**: Usa `panel-definer.html` para obtener coordenadas precisas
