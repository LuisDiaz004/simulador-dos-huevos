# Simulador de los 2 huevos

Aplicación web didáctica para explorar el problema de los 2 huevos y los 100 pisos como prototipo RUP de Elaboración.

## Requisitos cubiertos
- RN-02: F aleatorio entre 1 y 100 o escenario de huevo irrompible.
- RN-03 a RN-05: regla de ruptura, dos huevos y contador de lanzamientos.
- RN-06: pisos seguros en verde y pisos de ruptura en rojo.
- RN-07: avisa cuando se repite un piso cuyo resultado ya se conoce; el lanzamiento repetido también se cuenta.
- RN-08 y RN-09: valida la declaración del piso crítico y los límites de la partida.
- RN-10: modos Lineal, Mitad, Saltos de 10 y Óptima.

El estado de la partida permanece en memoria; no se guarda información.

## Uso
Sirve el proyecto con un servidor local (los módulos JavaScript no funcionan al abrir `index.html` directamente como archivo). Desde esta carpeta ejecuta `py -m http.server 8000` y abre `http://localhost:8000`. Para ejecutar las pruebas unitarias se requiere Node.js 18 o posterior:

```bash
node --test
```

## Estructura
- `index.html`: pantalla del simulador.
- `src/engine.js`: motor independiente de la interfaz.
- `src/app.js`, `src/styles.css`: interfaz y presentación.
- `tests/engine.test.js`: pruebas unitarias de reglas y estrategias.

## Ramas y commits
- `main`: estructura inicial y documentación.
- `develop`: implementación del motor, simulador y pruebas.

