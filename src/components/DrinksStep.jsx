import QuantityCounter from "./QuantityCounter";
import { formatMacro, formatMoney } from "../utils/formatters";

export default function DrinksStep({ menu, cart, onSetSimpleQuantity, setCurrentStep }) {
  const getQuantity = (drinkId) =>
    cart.find((item) => item.tipo === "bebida" && item.productoId === drinkId)?.cantidad || 0;

  return (
    <section className="step-content">
      <div className="section-head">
        <div>
          <p className="eyebrow">Paso 2</p>
          <h2>Deseas agregar bebidas?</h2>
        </div>
        <button type="button" className="secondary" onClick={() => setCurrentStep(2)}>
          Continuar sin bebidas
        </button>
      </div>

      <div className="catalog-grid">
        {menu.bebidas.map((drink) => (
          <article className="catalog-card" key={drink.id}>
            <div>
              <h3>{drink.nombre}</h3>
              <p>{drink.ingredientes.join(", ")}</p>
            </div>
            <div className="macro-grid">
              <span>{formatMacro(drink.nutricion.calorias, "kcal")}</span>
              <span>{formatMacro(drink.nutricion.proteina, "g proteina")}</span>
              <span>{formatMacro(drink.nutricion.carbohidratos, "g carbs")}</span>
              <span>{formatMacro(drink.nutricion.grasas, "g grasas")}</span>
            </div>
            <div className="catalog-bottom">
              <strong>{formatMoney(drink.precio, menu.negocio.moneda)}</strong>
              <QuantityCounter
                label={drink.nombre}
                value={getQuantity(drink.id)}
                onChange={(quantity) => onSetSimpleQuantity("bebida", drink, quantity)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="button-row end">
        <button type="button" className="primary" onClick={() => setCurrentStep(2)}>
          Ir a postres
        </button>
      </div>
    </section>
  );
}
