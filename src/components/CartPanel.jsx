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
            return (
              <article className="cart-item" key={item.idCarrito}>
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
