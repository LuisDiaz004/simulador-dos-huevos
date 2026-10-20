# Simulador de los 2 huevos

Pon a prueba el reto de encontrar el piso más alto desde el que el huevo todavía sobrevive. Tienes un edificio de 100 pisos y dos huevos. El piso crítico se elige al azar y se mantiene oculto.

## Cómo jugar

1. Arrastra un huevo desde el panel de partida hasta una ventana del edificio. Al soltarlo, comienza la caída. También puedes seleccionar un piso y pulsar **Soltar huevo**.
2. Si el huevo llega entero, ese piso queda marcado en verde y puedes volver a usarlo. Si se rompe, queda en rojo y pierdes ese huevo.
3. Usa el segundo huevo para seguir acotando el piso crítico.
4. Cuando tengas una respuesta, abre **¿Ya sabes la respuesta?** e indica el piso seguro más alto. Si el piso 1 rompe el huevo, la respuesta segura es 0; si ninguno se rompe, es 100.
5. Pulsa **Nueva partida** para volver a empezar.

## Cómo iniciar el juego

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
py -m http.server 8000
```

Luego abre [http://localhost:8000](http://localhost:8000) en Chrome o Firefox. Para detener el servidor, vuelve a PowerShell y pulsa `Ctrl+C`.

## Nota sobre la partida

La partida se mantiene solo mientras la página está abierta. Si la recargas, comienza una partida nueva; el juego no guarda resultados.
