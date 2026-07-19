import { getDishLabel, itemSubtotal } from "../utils/calculations";
import { formatMacro, formatMoney } from "../utils/formatters";
import DishBuilder from "./DishBuilder";

export default function MainDishStep({
  menu,
  cart,
  builderOpen,
  editingDish,
  onOpenBuilder,
  onCancelBuilder,
  onSaveDish,
  onEditDish,
  onDuplicateDish,
  onRemove,
  setCurrentStep
}) {
  const dishes = cart.filter((item) => item.tipo === "plato");

  return (
    <section className="step-content">
      <div className="section-head">
        <div>
          <p className="eyebrow">Paso 1</p>
          <h2>Platos fuertes</h2>
        </div>
        {!builderOpen && (
          <button type="button" className="primary" onClick={onOpenBuilder}>
            + Armar un plato
          </button>
        )}
      </div>

      <div className="keto-note">
        <strong>Keto friendly</strong>
        <span>Activalo al armar tu plato para dejar fuera arroz y tortillas.</span>
      </div>

      {builderOpen && (
        <DishBuilder menu={menu} editingDish={editingDish} onCancel={onCancelBuilder} onSave={onSaveDish} />
      )}

      <div className="item-stack">
        {dishes.length === 0 && !builderOpen ? (
          <p className="empty">Aun no hay platos. Puedes crear tantos como necesites.</p>
        ) : (
          dishes.map((dish, index) => {
            const label = getDishLabel(menu, dish);
            return (
              <article className="product-row" key={dish.idCarrito}>
                {label.details.protein?.imagen && (
                  <img
                    className="product-image"
                    src={label.details.protein.imagen}
                    alt={label.details.protein.nombre}
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="eyebrow">Plato {index + 1}</p>
                  <h3>{label.title} · {label.details.proteinTotals.label}</h3>
                  <p>{label.subtitle}</p>
                  <span>
                    {formatMacro(dish.nutricion.calorias, "kcal")} ·{" "}
                    {formatMacro(dish.nutricion.proteina, "g proteina")} ·{" "}
                    {formatMacro(dish.nutricion.carbohidratos, "g carbs")} ·{" "}
                    {formatMacro(dish.nutricion.grasas, "g grasas")}
                  </span>
                </div>
                <div className="row-actions">
                  <strong>{formatMoney(itemSubtotal(dish), menu.negocio.moneda)}</strong>
                  <button type="button" className="link" onClick={() => onEditDish(dish)}>
                    Editar
                  </button>
                  <button type="button" className="link" onClick={() => onDuplicateDish(dish)}>
                    Duplicar
                  </button>
                  <button type="button" className="link danger" onClick={() => onRemove(dish.idCarrito)}>
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="button-row end">
        <button type="button" className="primary" onClick={() => setCurrentStep(1)}>
          Ir a bebidas
        </button>
      </div>
    </section>
  );
}
