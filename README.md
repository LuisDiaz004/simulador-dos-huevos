# Simulador de los 2 huevos

Pon a prueba el reto de encontrar el piso más alto desde el que el huevo todavía sobrevive. Tienes un edificio de 100 pisos y dos huevos. Puedes dejar que el juego elija el piso crítico al azar o probar el escenario en que ningún piso rompe el huevo.

## Cómo jugar

1. Arrastra un huevo desde el panel de partida hasta una ventana del edificio. Al soltarlo, comienza la caída. También puedes seleccionar un piso y pulsar **Soltar huevo**.
2. Si el huevo llega entero, ese piso queda marcado en verde y puedes volver a usarlo. Si se rompe, queda en rojo y pierdes ese huevo.
3. Usa el segundo huevo para seguir acotando el piso crítico.
4. Cuando tengas una respuesta, abre **¿Ya sabes la respuesta?** e indica el piso seguro más alto. Si el piso 1 rompe el huevo, la respuesta segura es 0; si ninguno se rompe, es 100.
5. En **¿Qué estrategia encuentra antes el piso?**, elige una estrategia y un piso crítico manual, aleatorio o el escenario donde ninguno rompe. Avanza lanzamiento a lanzamiento y compara debajo el peor caso de cada estrategia.
6. Pulsa **Nueva partida** para volver a empezar. Si ya hiciste lanzamientos, el juego te pedirá confirmar antes de descartar la partida.

## Cómo iniciar el juego

Abre una terminal en la carpeta del proyecto y ejecuta:

```powershell
npm start
```

Abre la dirección que imprime la terminal (normalmente [http://127.0.0.1:8000](http://127.0.0.1:8000)) en Chrome o Firefox. Para detener el servidor, vuelve a la terminal y pulsa `Ctrl+C`. El servidor usa Node.js y no necesita instalar paquetes adicionales para iniciar el juego.

Si el puerto 8000 ya está ocupado, el servidor prueba automáticamente los siguientes puertos disponibles.

## Nota sobre la partida

La partida se mantiene solo mientras la página está abierta. Si la recargas, comienza una partida nueva; el juego no guarda resultados.
