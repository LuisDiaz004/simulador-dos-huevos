# Notas de versión

## 1.0.1-beta.2 — 20 de octubre de 2026

- Añade selección manual, aleatoria o sin piso crítico para la simulación paso a paso.
- Mantiene el juego principal con piso aleatorio o escenario sin rotura.
- Muestra los lanzamientos usados al declarar el resultado y aplica el escenario elegido al instante.
- Añade un servidor local de Node.js para iniciar el juego sin depender de Python.

### Verificación

`npm test`: 12 pruebas aprobadas con Jest.

## 1.0.1-beta.1 — 20 de octubre de 2026

- Añade selección manual, aleatoria o sin piso crítico para la simulación paso a paso.
- Mantiene el juego principal con piso aleatorio o escenario sin rotura.

### Verificación

`npm test`: 12 pruebas aprobadas con Jest.

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

`npm test`: 11 pruebas aprobadas con Jest. La aplicación es estática y puede iniciarse con el servidor local indicado en el README.
