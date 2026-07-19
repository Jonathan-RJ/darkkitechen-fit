import { cartTotals, getDishLabel, itemSubtotal } from "../utils/calculations";
import { formatMacro, formatMoney } from "../utils/formatters";

export default function CartPanel({
  menu,
  cart,
  onEditDish,
  onDuplicateDish,
  onRemove,
  onClear,
  setCurrentStep,
  compact = false
}) {
  const totals = cartTotals(cart);
  const hasDessert = cart.some((item) => item.tipo === "postre");
  const hasProteinDrink = cart.some((item) => item.tipo === "bebida" && item.nutricion.proteina >= 20);
  const featuredDessert = menu.postres[0];
  const proteinDrink =
    menu.bebidas.find((drink) => drink.id === "coffee-protein-ultra") ||
    [...menu.bebidas].sort((a, b) => b.nutricion.proteina - a.nutricion.proteina)[0];
  const suggestions = [
    featuredDessert && !hasDessert
      ? {
          tone: "sweet",
          eyebrow: "Antojo dulce",
          title: "Oye, estaria increible algo dulce, no?",
          text: `${featuredDessert.nombre}: ${featuredDessert.nutricion.proteina} g de proteina y cero drama.`,
          action: "Ver postres",
          step: 2
        }
      : null,
    proteinDrink && totals.nutrition.proteina < 55 && !hasProteinDrink
      ? {
          tone: "protein",
          eyebrow: "Subele proteina",
          title: "Hey, si no llegaste a tus requerimientos...",
          text: `Que tal un ${proteinDrink.nombre}? Te suma ${proteinDrink.nutricion.proteina} g de proteina.`,
          action: "Ver bebidas",
          step: 1
        }
      : null
  ].filter(Boolean);

  return (
    <aside className={compact ? "cart-panel compact" : "cart-panel"}>
      <div className="panel-title">
        <div>
          <p className="eyebrow">Pedido actual</p>
          <h2>Tu carrito</h2>
        </div>
        {cart.length > 0 && (
          <button type="button" className="link danger" onClick={onClear}>
            Vaciar
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="empty">Tu carrito esta vacio. Agrega un plato para empezar.</p>
      ) : (
        <div className="cart-list">
          {cart.map((item) => {
            const dishLabel = item.tipo === "plato" ? getDishLabel(menu, item) : null;
            const image = item.tipo === "plato" ? dishLabel.details.protein?.imagen : item.imagen;
            return (
              <article className="cart-item" key={item.idCarrito}>
                {image && (
                  <img
                    className="cart-thumb"
                    src={image}
                    alt={item.tipo === "plato" ? dishLabel.title : item.nombre}
                    loading="lazy"
                  />
                )}
                <div>
                  <strong>{item.tipo === "plato" ? dishLabel.title : item.nombre}</strong>
                  <p>{item.tipo === "plato" ? dishLabel.subtitle : `Cantidad: ${item.cantidad}`}</p>
                  <span>
                    {formatMacro(item.nutricion.calorias, "kcal")} · {formatMacro(item.nutricion.proteina, "g proteina")}
                  </span>
                </div>
                <div className="cart-actions">
                  <b>{formatMoney(itemSubtotal(item), menu.negocio.moneda)}</b>
                  {item.tipo === "plato" && (
                    <>
                      <button type="button" className="link" onClick={() => onEditDish(item)}>
                        Editar
                      </button>
                      <button type="button" className="link" onClick={() => onDuplicateDish(item)}>
                        Duplicar
                      </button>
                    </>
                  )}
                  <button type="button" className="link danger" onClick={() => onRemove(item.idCarrito)}>
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="side-ads" aria-label="Sugerencias para completar tu pedido">
          {suggestions.map((suggestion) => (
            <article className={`side-ad ${suggestion.tone}`} key={suggestion.eyebrow}>
              <div>
                <p className="eyebrow">{suggestion.eyebrow}</p>
                <h3>{suggestion.title}</h3>
                <p>{suggestion.text}</p>
              </div>
              <button type="button" className="link" onClick={() => setCurrentStep(suggestion.step)}>
                {suggestion.action}
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="totals-mini">
        <span>Productos: {totals.products}</span>
        <strong>{formatMoney(totals.money, menu.negocio.moneda)}</strong>
      </div>
      <button type="button" className="primary full" onClick={() => setCurrentStep(3)}>
        Ver pedido
      </button>
    </aside>
  );
}
