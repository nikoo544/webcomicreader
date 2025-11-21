# 🚀 Guía de Publicación en GitHub Pages

## Requisitos Previos
- Cuenta de GitHub (gratis): https://github.com/signup
- Git instalado en tu computadora

## 📋 Pasos para Publicar

### 1. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `webcomic` (o el nombre que prefieras)
3. Descripción: "Interactive webcomic reader with audio support"
4. Selecciona: **Public** (para GitHub Pages gratis)
5. **NO** marques "Add a README file" (ya lo tienes)
6. Click en **Create repository**

### 2. Inicializar Git en tu Proyecto

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Inicializar repositorio git
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit: Webcomic reader with panel system and audio"

# Renombrar rama a main
git branch -M main

# Conectar con GitHub (reemplaza TU-USUARIO y TU-REPO)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# Subir archivos
git push -u origin main
```

### 3. Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En "Source", selecciona: **main** branch
5. Click en **Save**
6. Espera 1-2 minutos

### 4. ¡Listo! 🎉

Tu sitio estará disponible en:
```
https://TU-USUARIO.github.io/TU-REPO/
```

Por ejemplo:
- Usuario: `nikoe`
- Repo: `webcomic`
- URL: `https://nikoe.github.io/webcomic/`

## 🔄 Actualizar el Sitio

Cuando hagas cambios:

```powershell
git add .
git commit -m "Descripción de los cambios"
git push
```

Los cambios aparecerán en 1-2 minutos.

## 🎨 Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. En Settings > Pages
2. En "Custom domain", ingresa tu dominio
3. Configura los DNS según las instrucciones de GitHub

## 🐛 Solución de Problemas

### El sitio no carga
- Espera 2-3 minutos después de activar Pages
- Verifica que la rama sea "main"
- Verifica que el repositorio sea público

### Las imágenes no se ven
- Verifica que las rutas sean relativas (no absolutas)
- Ejemplo correcto: `images/dragon1.png`
- Ejemplo incorrecto: `/images/dragon1.png` o `C:/Users/...`

### El audio no funciona
- GitHub Pages usa HTTPS, verifica que los archivos de audio estén en la carpeta `audio/`
- Algunos navegadores bloquean autoplay de audio

## 📱 Compartir tu Webcomic

Una vez publicado, puedes compartir la URL en:
- Redes sociales
- Tu portafolio
- Foros de webcomics
- Con amigos y familia

## 💡 Tips

- **Optimiza imágenes**: Usa herramientas como TinyPNG para reducir el tamaño
- **Actualiza regularmente**: Sube nuevas páginas con `git push`
- **Haz backups**: Git guarda todo el historial automáticamente
- **Usa branches**: Crea ramas para experimentar sin romper la versión publicada

## 🆘 Ayuda

Si tienes problemas:
1. Revisa la documentación oficial: https://docs.github.com/pages
2. Verifica el estado de GitHub: https://www.githubstatus.com/
3. Consulta los logs de deployment en Settings > Pages
