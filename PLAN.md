# Plan de implementacion - ChisFit

## Analisis del requerimiento

Se construira una aplicacion web sin backend para que el cliente arme pedidos de comida fitness en cuatro pasos: platos fuertes, bebidas, postres y resumen. El carrito debe aceptar varios productos, conservarse en localStorage, calcular totales nutricionales y economicos, y generar un mensaje listo para WhatsApp con un numero configurable desde JSON.

Tambien se incluira un estilo visual moderno tipo aqua glass, una opcion keto friendly para evitar carbohidratos fuertes, una proteina de huevos duros con control de huevos y yemas, y una seccion informativa sobre como se preparan las comidas.

## Estructura de carpetas

```text
.
├── index.html
├── package.json
├── README.md
├── PLAN.md
└── src
    ├── App.jsx
    ├── main.jsx
    ├── data
    │   └── menu.json
    ├── styles
    │   └── styles.css
    ├── components
    │   ├── CartPanel.jsx
    │   ├── ConfirmationModal.jsx
    │   ├── CustomerForm.jsx
    │   ├── DishBuilder.jsx
    │   ├── DrinksStep.jsx
    │   ├── Header.jsx
    │   ├── HowWePrepare.jsx
    │   ├── MainDishStep.jsx
    │   ├── OrderSummary.jsx
    │   ├── QuantityCounter.jsx
    │   ├── StepIndicator.jsx
    │   └── DessertsStep.jsx
    └── utils
        ├── calculations.js
        ├── formatters.js
        ├── storage.js
        └── whatsapp.js
```

## Modelos de datos

- `negocio`: nombre, moneda y numero de WhatsApp.
- `configuracion`: incrementos, maximos, metodo de coccion, sazonado, ingredientes omitibles y reglas de validacion.
- `proteinas`: proteinas por gramos o por piezas, con precio y nutricion configurable.
- `carbohidratos`, `verduras`, `grasas`, `ensaladas`: opciones seleccionables para platos.
- `bebidas`: productos simples con cantidad.
- `postres`: productos con cantidad y extra opcional de proteina.
- `carrito`: lista de elementos con `idCarrito`, `tipo`, `cantidad`, `configuracion`, `nutricion` y `precioUnitario`.

## Flujo de estado

- `currentStep`: controla el paso activo.
- `cart`: contiene todos los productos del pedido.
- `editingDish`: guarda el plato en edicion.
- `customer`: datos minimos del cliente.
- `errors`: mensajes de validacion.
- `ketoMode`: ayuda a crear platos sin arroz ni tortillas.
- `localStorage`: persiste carrito, paso actual y datos del cliente.

## Tareas

1. Crear base Vite + React y estilos globales responsive.
2. Definir JSON editable del menu.
3. Implementar utilidades de calculo, formato, persistencia, validacion y WhatsApp.
4. Crear componentes de pasos y controles reutilizables.
5. Implementar platos fuertes con configurador, edicion, duplicado, eliminacion y modo keto.
6. Implementar bebidas y postres opcionales con acumuladores.
7. Implementar resumen, formulario de cliente, modal de confirmacion y enlace wa.me.
8. Agregar seccion "Como preparamos las comidas".
9. Verificar build y flujos principales.
10. Documentar ejecucion y configuracion en README.md.
