import QuantityCounter from "./QuantityCounter";
import { formatMacro, formatMoney } from "../utils/formatters";

export default function DessertsStep({ menu, cart, onSetSimpleQuantity, setCurrentStep }) {
  const getQuantity = (dessertId, extraProtein) =>
    cart.find(
      (item) =>
        item.tipo === "postre" &&
        item.productoId === dessertId &&
        Boolean(item.configuracion.extraProteina) === extraProtein
    )?.cantidad || 0;

  return (
    <section className="step-content">
      <div className="section-head">
        <div>
          <p className="eyebrow">Paso 3</p>
          <h2>Deseas agregar postres?</h2>
        </div>
        <button type="button" className="secondary" onClick={() => setCurrentStep(3)}>
          Continuar sin postres
        </button>
      </div>

      <div className="catalog-grid desserts">
        {menu.postres.map((dessert) => (
          <article className="catalog-card" key={dessert.id}>
            <div>
              <h3>{dessert.nombre}</h3>
              <p>{dessert.descripcion}</p>
            </div>
            <div className="macro-grid">
              <span>{formatMacro(dessert.nutricion.calorias, "kcal")}</span>
              <span>{formatMacro(dessert.nutricion.proteina, "g proteina")}</span>
              <span>{formatMacro(dessert.nutricion.carbohidratos, "g carbs")}</span>
              <span>{formatMacro(dessert.nutricion.grasas, "g grasas")}</span>
            </div>
            <div className="variant-row">
              <div>
                <strong>{formatMoney(dessert.precio, menu.negocio.moneda)}</strong>
                <span>Sin extra</span>
              </div>
              <QuantityCounter
                label={`${dessert.nombre} sin extra`}
                value={getQuantity(dessert.id, false)}
                onChange={(quantity) => onSetSimpleQuantity("postre", dessert, quantity, false)}
              />
            </div>
            <div className="variant-row accent">
              <div>
                <strong>
                  {formatMoney(dessert.precio + menu.extraProteinaPostre.precio, menu.negocio.moneda)}
                </strong>
                <span>{menu.extraProteinaPostre.nombre}</span>
              </div>
              <QuantityCounter
                label={`${dessert.nombre} con extra`}
                value={getQuantity(dessert.id, true)}
                onChange={(quantity) => onSetSimpleQuantity("postre", dessert, quantity, true)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="button-row end">
        <button type="button" className="primary" onClick={() => setCurrentStep(3)}>
          Ver resumen
        </button>
      </div>
    </section>
  );
}
