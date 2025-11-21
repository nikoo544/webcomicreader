## 🔍 Diagnóstico del Problema de Pantalla Negra

### Pasos para Diagnosticar:

1. **Abre `test-panel.html` en tu navegador**
   - Este archivo te ayudará a identificar el problema
   - Prueba cada botón en orden

2. **Abre la Consola del Navegador (F12)**
   - Ve a la pestaña "Console"
   - Busca mensajes de error en rojo

3. **Verifica las Rutas de Archivos**
   - Las imágenes deben estar en: `images/page1.png` y `images/page2.png`
   - Verifica que los nombres coincidan exactamente (mayúsculas/minúsculas)

### Posibles Causas:

#### 1. Problema de Ruta de Imagen
- ✅ **Solución**: Verifica que `images/page1.png` existe
- ✅ **Comando**: Abre `test-panel.html` y haz clic en "Probar Carga de Imagen"

#### 2. Problema de Canvas
- ✅ **Solución**: El navegador podría no soportar Canvas API
- ✅ **Test**: Abre `test-panel.html` y haz clic en "Probar Recorte de Panel"

#### 3. Problema de CSS/Z-Index
- ✅ **Solución**: El overlay podría estar tapando el contenido
- ✅ **Verificar**: Inspecciona el elemento con F12

### Solución Rápida:

Si ves todo negro en el modo panel:

1. **Presiona F12** para abrir DevTools
2. **Ve a la pestaña Console**
3. **Busca errores** (líneas rojas)
4. **Comparte el error** que veas

### Logs Esperados en la Consola:

Cuando funciona correctamente, deberías ver:
```
Rendering panel: panel1 from page 1
Loading image: images/page1.png
Image loaded successfully: 1920 x 1080
Crop dimensions: {x: 48, y: 29.16, width: 1870.08, height: 520.56}
Panel rendered successfully
```

### Comandos de Debug:

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver el estado actual
console.log('Current page:', currentPageIndex);
console.log('Current panel:', currentPanelIndex);
console.log('Panel data:', comicData[0].panels[0]);

// Verificar que la imagen existe
const testImg = new Image();
testImg.onload = () => console.log('✅ Image loads OK');
testImg.onerror = () => console.log('❌ Image failed to load');
testImg.src = 'images/page1.png';
```

### Archivos de Ayuda:

- `test-panel.html` - Herramienta de diagnóstico
- `index.html` - Reader principal (con logs de debug agregados)
- Esta guía - `DEBUG.md`

### Próximos Pasos:

1. Abre `test-panel.html`
2. Ejecuta las pruebas
3. Si falla, revisa la consola
4. Si todo pasa, intenta `index.html` de nuevo

### Notas:

- He agregado logs de consola detallados al código
- Cada paso del proceso de renderizado ahora imprime información
- Si ves "Panel rendered successfully" pero pantalla negra, es un problema de CSS
- Si no ves ningún log, es un problema de JavaScript

---

**¿Necesitas más ayuda?** Abre `test-panel.html` y comparte qué ves.
