# Retoka

Editor de fotos con IA, fácil para principiantes y más asequible que las herramientas profesionales.

## Qué incluye (prototipo web)

- **Retoka IA:** mejora automática (luz, color real, contraluz, nitidez), quitar fondo (modelo en el navegador, modo Preciso y Rápido, pincel de corrección), borrar objetos con relleno inteligente, recuperar nitidez, mejorar resolución.
- **Ajustes profesionales:** histograma, exposición, contraste, luces, sombras, blancos, negros, temperatura, tono, intensidad, saturación, curvas (RGB y por canal), mezcla de color (HSL de 8 colores), nitidez, reducción de ruido, claridad y quitar neblina.
- **Recortar y enderezar**, girar y voltear.
- **Zonas:** degradados y radiales con ajustes locales.
- **Retrato** (retoque de piel) y **Paisajes perfectos** (cielo, agua, vegetación, tierra).
- **Filtros**, **efectos**, **texto** con 19 fuentes.
- **Collage** (cuadrícula con o sin bordes, diagonal, burbujas, polaroid, revista, película).
- **Carrusel** para Instagram (una por slide, panorámico, puzzle continuo, portada + historia, editorial).
- Deshacer y rehacer de todo, y "Volver a la foto original".

## Estructura

```
app/            La aplicación lista para servir (abrir app/index.html desde un servidor web)
  index.html    Editor completo (HTML + CSS + JS en un solo archivo)
  bg.js         Librería de quitar fondo empaquetada (@imgly/background-removal)
  imgly/        Modelos de IA y runtime (ONNX/WASM) en partes de 4 MB
assets/         Logo de Retoka
tools/          Código fuente editable y scripts de compilación
```

## Probar en local

```bash
cd app
python3 -m http.server 8080
# abrir http://localhost:8080
```

Debe servirse desde un servidor web (no abriendo el archivo directamente), porque los modelos se cargan por red.

## Editar

1. Edita `tools/index.src.html`.
2. Ejecuta `python3 tools/build.py` para generar `app/index.html` con el logo incluido.

Para recompilar `bg.js`: `cd tools && npm install && npm run build:bg`.

## Notas

- "Mejorar con IA" usa la visión de Claude cuando la app corre dentro de Claude; fuera de Claude usa el análisis local. Para la versión de pago habrá que conectar un proveedor de IA propio.
- Licencias de modelos: revisar antes de uso comercial.
