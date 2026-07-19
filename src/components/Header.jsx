export default function Header({ menu }) {
  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Menu fitness personalizable</p>
        <h1>{menu.negocio.nombre}</h1>
        <p className="lead">
          Arma tu comida a tu manera, conoce sus porciones y disfruta una opcion practica, completa y
          deliciosa.
        </p>
        <p>
          Todos nuestros alimentos son preparados en freidora de aire y pesados minuciosamente en su estado
          crudo, antes de su preparacion.
        </p>
        <p>
          Nuestras comidas se sazonan con sal, ajo, sazonador universal y pimienta. Por defecto incluyen
          tomate, cebolla y cilantro, aunque puedes solicitar que se omita cualquiera de estos ingredientes.
        </p>
        <p>
          Selecciona tus platos fuertes y, si lo deseas, agrega bebidas o postres. Recuerda que llevar una
          alimentacion saludable tambien significa comer de manera equilibrada, suficiente y variada.
        </p>
        <small>{menu.configuracion.notaNutricional}</small>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="plate">
          <span />
          <strong>Air fryer</strong>
          <em>Sin grasa agregada por defecto</em>
        </div>
      </div>
    </header>
  );
}
