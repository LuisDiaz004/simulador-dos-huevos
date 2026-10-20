# Notas de versión

## 1.0.0 — 20 de octubre de 2026

- Juego interactivo con edificio de 100 pisos, dos huevos, arrastre y animación de caída.
- Resultados destacados para huevos que sobreviven o se rompen.
- Piso crítico aleatorio o escenario donde ningún piso rompe el huevo.
- Aviso de piso ya probado sin sumar lanzamiento ni gastar un huevo.
- Declaración del piso seguro más alto, con victoria o derrota y revelación del resultado real.
- Simulación paso a paso de las estrategias Lineal, Mitad, Saltos de 10 y Óptima.
- Comparación visual de intentos máximos: 100, 50, 19 y 14.
- Pruebas unitarias con Jest para las reglas principales y las cuatro estrategias.

### Verificación

`npm test`: 10 pruebas aprobadas. La aplicación es estática y puede iniciarse con el servidor local indicado en el README.
