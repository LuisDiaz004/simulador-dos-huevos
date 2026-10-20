# Simulador de los 2 huevos

Pon a prueba el reto de encontrar el piso más alto desde el que el huevo todavía sobrevive. Tienes un edificio de 100 pisos y dos huevos. En la partida, el piso crítico se elige automáticamente para que puedas concentrarte en probar estrategias.

## Organización del proyecto

- `src/motor/`: reglas de la partida, estado del edificio y lanzamientos.
- `src/vista/`: interfaz, eventos del jugador y estilos.
- `src/estrategias/`: estrategias de búsqueda y simulación.
- `tests/`: pruebas automatizadas de la lógica y las estrategias.

## Cómo jugar

1. Arrastra un huevo desde el panel de partida hasta una ventana del edificio. Al soltarlo, comienza la caída. También puedes seleccionar un piso y pulsar **Soltar huevo**.
2. Si el huevo llega entero, ese piso queda marcado en verde y puedes volver a usarlo. Si se rompe, queda en rojo y pierdes ese huevo.
3. Usa el segundo huevo para seguir acotando el piso crítico.
4. Cuando tengas una respuesta, abre **¿Ya sabes la respuesta?** e indica el piso seguro más alto. Si el piso 1 rompe el huevo, la respuesta segura es 0; si ninguno se rompe, es 100.
5. En **¿Qué estrategia encuentra antes el piso?**, elige una estrategia y el modo del piso crítico. Si eliges «Elegir manualmente», indica un piso; en los otros modos el campo se oculta. Avanza lanzamiento a lanzamiento y compara el peor caso de cada estrategia.
6. Pulsa **Nueva partida** para volver a empezar. Si ya hiciste lanzamientos, el juego te pedirá confirmar antes de descartar la partida.

## Cómo iniciar en Windows

No necesitas instalar Python, Node.js ni paquetes. Con PowerShell, incluido en Windows:

1. Descarga el proyecto desde GitHub y descomprime el ZIP, o abre la carpeta del proyecto si ya la tienes.
2. En el Explorador de archivos, abre la carpeta del proyecto, haz clic en la barra de direcciones, escribe `powershell` y pulsa Enter.
3. Ejecuta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-server.ps1
```

4. Abre en el navegador la dirección que aparecerá en la terminal, normalmente [http://127.0.0.1:8000](http://127.0.0.1:8000).
5. Para cerrar el servidor, vuelve a esa ventana y pulsa `Ctrl+C`.

El script usa componentes de Windows, solo acepta conexiones de tu propio equipo y, si el puerto 8000 está ocupado, prueba automáticamente los siguientes. También puedes elegir otro puerto, por ejemplo: `powershell -NoProfile -ExecutionPolicy Bypass -File .\start-server.ps1 -Port 8080`.

## Nota sobre la partida

La partida se mantiene solo mientras la página está abierta. Si la recargas, comienza una partida nueva; el juego no guarda resultados.
