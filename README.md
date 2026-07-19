# ChisFit

Aplicacion web sencilla para armar pedidos de comida fitness con platos fuertes, bebidas, postres, resumen nutricional y mensaje listo para WhatsApp.

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Luego abre la URL que muestre Vite, normalmente `http://127.0.0.1:5173/`.

Para generar una version de produccion:

```bash
npm run build
```

## Despliegue en GitHub Pages

El proyecto esta preparado para publicarse en:

```text
https://jonathan-rj.github.io/darkkitechen-fit/
```

La configuracion de Vite usa `base: "/darkkitechen-fit/"` para que los archivos CSS y JS carguen correctamente desde GitHub Pages. El workflow `.github/workflows/deploy.yml` instala dependencias, ejecuta `npm run build` y publica la carpeta `dist`.

Antes del primer despliegue, en GitHub entra a `Settings > Pages` y selecciona `GitHub Actions` como fuente de publicacion. Despues, cada push a `main` lanzara el despliegue automaticamente.

## Configurar el menu

Todo el menu vive en [src/data/menu.json](src/data/menu.json). Desde ahi puedes cambiar:

- Nombre del negocio, moneda y numero de WhatsApp.
- Tipos de carne/proteina principal, porciones base, precios y nutricion.
- Carbohidratos, verduras, grasas y ensaladas.
- Bebidas y postres.
- Extra de proteina para postres.
- Textos de preparacion y URLs de videos.

Los valores nutricionales incluidos son de ejemplo y estan pensados como datos configurables.

## Cambiar el numero de WhatsApp

Edita este campo en [src/data/menu.json](src/data/menu.json):

```json
"numeroWhatsApp": "529681510990"
```

Usa el formato internacional sin espacios, guiones ni signo `+`. Ejemplo para Mexico:

```json
"numeroWhatsApp": "5215512345678"
```

## Flujo incluido

- Crear varios platos fuertes.
- Editar, duplicar y eliminar platos.
- Aumentar carne/proteina principal por incrementos de 50 g.
- Seleccionar huevos duros, cantidad de huevos y cantidad de yemas.
- Activar modo keto friendly para evitar arroz y tortillas.
- Agregar chiles en escabeche por plato.
- Elegir arroz, tortillas, arroz y tortillas, o sin carbohidrato.
- Agregar extra de carbohidrato por plato con check.
- Agregar extra de grasa y extra de ensalada con precio configurable de $10 MXN.
- Ver grafica circular de macros en la vista previa de cada plato.
- Agregar bebidas y postres opcionales.
- Agregar postres normales o con extra de 10 g de proteina.
- Ver totales de calorias, proteina, carbohidratos, grasas y precio.
- Ver grafica de macros y consejos rapidos al final del resumen.
- Mostrar una nota de entrega por mandadito o mandadito de confianza.
- Mostrar que todos los pagos son por transferencia.
- Detectar automaticamente si el horario de pedido esta abierto.
- Permitir enviar pedidos solo de 7:00 a. m. a 12:00 p. m.; fuera de ese horario el carrito queda guardado en canasta.
- Pedir la hora deseada para recibir o recoger la comida.
- Guardar la canasta temporalmente en este dispositivo.
- Guardar temporalmente el pedido en `localStorage`.
- Validar datos del cliente antes de abrir WhatsApp.
- Generar mensaje de WhatsApp con saltos de linea y separadores para facilitar la lectura.

## Guardar en canasta

El pedido se guarda automaticamente en `localStorage`, y el boton `Guardar en canasta` confirma que el cliente puede retomarlo despues en el mismo dispositivo.

## Videos de preparacion

En `menu.json`, agrega URLs embebibles en:

```json
"preparacion": {
  "videos": [
    {
      "titulo": "Preparacion en freidora de aire",
      "url": ""
    }
  ]
}
```

Si la URL esta vacia, la app muestra un espacio reservado para el video.
