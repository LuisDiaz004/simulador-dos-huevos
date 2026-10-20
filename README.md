# Simulador de los 2 huevos

Pon a prueba el reto de encontrar el piso más alto desde el que el huevo todavía sobrevive. Tienes un edificio de 100 pisos y dos huevos. Puedes dejar que el juego elija el piso crítico al azar o probar el escenario en que ningún piso rompe el huevo.

## Cómo jugar

1. Arrastra un huevo desde el panel de partida hasta una ventana del edificio. Al soltarlo, comienza la caída. También puedes seleccionar un piso y pulsar **Soltar huevo**.
2. Si el huevo llega entero, ese piso queda marcado en verde y puedes volver a usarlo. Si se rompe, queda en rojo y pierdes ese huevo.
3. Usa el segundo huevo para seguir acotando el piso crítico.
4. Cuando tengas una respuesta, abre **¿Ya sabes la respuesta?** e indica el piso seguro más alto. Si el piso 1 rompe el huevo, la respuesta segura es 0; si ninguno se rompe, es 100.
5. En **¿Qué estrategia encuentra antes el piso?**, elige una estrategia y un piso crítico para verla avanzar lanzamiento a lanzamiento. Usa `101` para simular que ningún piso rompe el huevo; debajo se compara el peor caso de cada estrategia.
6. Pulsa **Nueva partida** para volver a empezar. Si ya hiciste lanzamientos, el juego te pedirá confirmar antes de descartar la partida.

## Cómo iniciar el juego

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
py -m http.server 8000
```

Luego abre [http://localhost:8000](http://localhost:8000) en Chrome o Firefox. Para detener el servidor, vuelve a PowerShell y pulsa `Ctrl+C`.

## Nota sobre la partida

La partida se mantiene solo mientras la página está abierta. Si la recargas, comienza una partida nueva; el juego no guarda resultados.
