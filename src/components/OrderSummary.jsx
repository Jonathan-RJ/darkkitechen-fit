import CustomerForm from "./CustomerForm";
import QuantityCounter from "./QuantityCounter";
import { cartTotals, getDishDetails, itemSubtotal } from "../utils/calculations";
import { formatDateTime, formatMacro, formatMoney, joinNames, roundMacro } from "../utils/formatters";
import { readableDelivery } from "../utils/whatsapp";

function MacroChart({ nutrition }) {
  const proteinCalories = nutrition.proteina * 4;
  const carbCalories = nutrition.carbohidratos * 4;
  const fatCalories = nutrition.grasas * 9;
  const macroCalories = proteinCalories + carbCalories + fatCalories || 1;
  const macros = [
    {
      label: "Proteina",
      grams: nutrition.proteina,
      percent: Math.round((proteinCalories / macroCalories) * 100),
      className: "protein"
    },
    {
      label: "Carbs",
      grams: nutrition.carbohidratos,
      percent: Math.round((carbCalories / macroCalories) * 100),
      className: "carbs"
    },
    {
      label: "Grasas",
      grams: nutrition.grasas,
      percent: Math.round((fatCalories / macroCalories) * 100),
      className: "fats"
    }
  ];

  const tips = [
    nutrition.proteina >= 35
      ? "Buen aporte de proteina para una comida completa."
      : "Puedes subir la proteina si quieres una comida mas saciante.",
    nutrition.carbohidratos <= 20
      ? "Perfil bajo en carbohidratos, buena ruta keto friendly."
      : "Si buscas algo mas ligero en carbs, elige sin carbohidrato.",
    nutrition.grasas > 35
      ? "Las grasas estan altas; revisa aguacate o yemas si quieres bajar calorias."
      : "Grasas moderadas para mantener equilibrio."
  ];

  return (
    <section className="macro-chart-card">
      <div>
        <p className="eyebrow">Grafica de macros</p>
        <h2>Balance del pedido</h2>
      </div>
      <div className="macro-bars" aria-label="Distribucion estimada de macros">
        {macros.map((macro) => (
          <div className="macro-bar-row" key={macro.label}>
            <div>
              <strong>{macro.label}</strong>
              <span>{formatMacro(roundMacro(macro.grams), "g")} · {macro.percent}%</span>
            </div>
            <div className="macro-track">
              <span className={macro.className} style={{ width: `${Math.max(macro.percent, 4)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="tips-grid">
        {tips.map((tip) => (
          <p key={tip}>{tip}</p>
        ))}
      </div>
    </section>
  );
}

function NutritionTotals({ totals, currency }) {
  return (
    <section className="totals-card">
      <h2>Totales generales</h2>
      <div className="totals-grid">
        <span>Productos totales</span>
        <strong>{totals.products}</strong>
        <span>Calorias estimadas</span>
        <strong>{formatMacro(totals.nutrition.calorias, "kcal")}</strong>
        <span>Proteina</span>
        <strong>{formatMacro(totals.nutrition.proteina, "g")}</strong>
        <span>Carbohidratos</span>
        <strong>{formatMacro(totals.nutrition.carbohidratos, "g")}</strong>
        <span>Grasas</span>
        <strong>{formatMacro(totals.nutrition.grasas, "g")}</strong>
      </div>
      <div className="grand-total">
        <span>Total del pedido</span>
        <strong>{formatMoney(totals.money, currency)}</strong>
      </div>
    </section>
  );
}

function BasketHeader({ menu, orderDate, onSaveBasket, disabled }) {
  return (
    <section className="receipt-header">
      <div>
        <p className="eyebrow">Canasta guardada</p>
        <h2>Tu pedido se queda en la canasta</h2>
        <p>
          Pedido armado el <strong>{formatDateTime(orderDate)}</strong>. Puedes dejar tu pedido en la
          canasta y retomarlo despues en este mismo dispositivo.
        </p>
        <small>
          {menu.negocio.nombre} confirmara disponibilidad y horario por WhatsApp antes de preparar el pedido.
        </small>
      </div>
      <button type="button" className="secondary" onClick={onSaveBasket} disabled={disabled}>
        Guardar en canasta
      </button>
    </section>
  );
}

export default function OrderSummary({
  menu,
  cart,
  customer,
  setCustomer,
  orderDate,
  orderingStatus,
  errors,
  onEditDish,
  onRemove,
  onQuantityChange,
  onRequestOrder,
  onSaveBasket,
  setCurrentStep
}) {
  const totals = cartTotals(cart);
  const dishes = cart.filter((item) => item.tipo === "plato");
  const drinks = cart.filter((item) => item.tipo === "bebida");
  const desserts = cart.filter((item) => item.tipo === "postre");

  return (
    <section className="step-content summary-screen print-area">
      <div className="section-head">
        <div>
          <p className="eyebrow">Paso 4</p>
          <h2>Resumen del pedido</h2>
        </div>
        <button type="button" className="secondary" onClick={() => setCurrentStep(0)}>
          Seguir agregando
        </button>
      </div>

      <BasketHeader
        menu={menu}
        orderDate={orderDate}
        onSaveBasket={onSaveBasket}
        disabled={cart.length === 0}
      />

      {errors.cart && <p className="form-error">{errors.cart}</p>}
      {errors.horario && <p className="form-error">{errors.horario}</p>}
      {cart.length === 0 && <p className="empty">Tu carrito esta vacio. Vuelve al menu para agregar productos.</p>}

      {dishes.length > 0 && (
        <section className="summary-group">
          <h2>Platos fuertes</h2>
          {dishes.map((item, index) => {
            const details = getDishDetails(menu, item.configuracion);
            return (
              <article className="summary-item" key={item.idCarrito}>
                <div className="summary-top">
                  <div>
                    <p className="eyebrow">Plato {index + 1}</p>
                    <h3>{details.protein.nombre}</h3>
                  </div>
                  <QuantityCounter
                    label={`Cantidad plato ${index + 1}`}
                    min={1}
                    value={item.cantidad}
                    onChange={(quantity) => onQuantityChange(item.idCarrito, quantity)}
                  />
                </div>

                <dl className="detail-list">
                  <dt>Tipo de carne o proteina</dt>
                  <dd>{details.protein.nombre}</dd>
                  <dt>Porcion base</dt>
                  <dd>{details.proteinTotals.baseLabel}</dd>
                  <dt>Extra agregado</dt>
                  <dd>{details.proteinTotals.extraLabel}</dd>
                  <dt>Cantidad total por plato</dt>
                  <dd>{details.proteinTotals.label}</dd>
                  <dt>Carbohidrato</dt>
                  <dd>
                    {details.carb.nombre}
                    {details.hasExtraCarb &&
                      ` + extra (${formatMoney(
                        menu.configuracion.extraCarbohidrato.precioExtra,
                        menu.negocio.moneda
                      )})`}
                  </dd>
                  <dt>Verduras</dt>
                  <dd>{joinNames(details.vegetables.map((veg) => veg.nombre))}</dd>
                  <dt>Grasa</dt>
                  <dd>
                    {details.fat.nombre}
                    {details.fat.descripcion && ` (${details.fat.descripcion})`}
                    {details.hasExtraFat &&
                      ` + extra (${formatMoney(menu.configuracion.extraGrasa.precioExtra, menu.negocio.moneda)})`}
                  </dd>
                  <dt>Ensalada</dt>
                  <dd>
                    {details.salad.nombre}
                    {details.hasExtraSalad &&
                      ` + extra (${formatMoney(menu.configuracion.extraEnsalada.precioExtra, menu.negocio.moneda)})`}
                  </dd>
                  <dt>Preparacion</dt>
                  <dd>
                    Cocinado en freidora de aire. Sazonado con sal, ajo, sazonador universal y pimienta.
                    {Object.entries(item.configuracion.ingredientesPreparacion).map(([ingredient, selected]) => (
                      <span key={ingredient}>
                        {selected ? "Con" : "Sin"} {ingredient.toLowerCase()}.
                      </span>
                    ))}
                    <span>
                      {item.configuracion.picante
                        ? menu.configuracion.picante.nombre
                        : "Sin chiles en escabeche."}
                    </span>
                  </dd>
                  <dt>Nutricion por unidad</dt>
                  <dd>
                    {formatMacro(item.nutricion.calorias, "kcal")} ·{" "}
                    {formatMacro(item.nutricion.proteina, "g proteina")} ·{" "}
                    {formatMacro(item.nutricion.carbohidratos, "g carbohidratos")} ·{" "}
                    {formatMacro(item.nutricion.grasas, "g grasas")}
                  </dd>
                  <dt>Precio unitario</dt>
                  <dd>{formatMoney(item.precioUnitario, menu.negocio.moneda)}</dd>
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(itemSubtotal(item), menu.negocio.moneda)}</dd>
                </dl>

                <div className="button-row">
                  <button type="button" className="secondary" onClick={() => onEditDish(item)}>
                    Editar
                  </button>
                  <button type="button" className="secondary danger-button" onClick={() => onRemove(item.idCarrito)}>
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {drinks.length > 0 && (
        <section className="summary-group">
          <h2>Bebidas</h2>
          {drinks.map((item) => (
            <article className="compact-summary" key={item.idCarrito}>
              <div>
                <strong>{item.nombre}</strong>
                <p>{formatMoney(itemSubtotal(item), menu.negocio.moneda)}</p>
              </div>
              <QuantityCounter
                label={item.nombre}
                min={1}
                value={item.cantidad}
                onChange={(quantity) => onQuantityChange(item.idCarrito, quantity)}
              />
              <button type="button" className="link danger" onClick={() => onRemove(item.idCarrito)}>
                Eliminar
              </button>
            </article>
          ))}
        </section>
      )}

      {desserts.length > 0 && (
        <section className="summary-group">
          <h2>Postres</h2>
          {desserts.map((item) => (
            <article className="compact-summary" key={item.idCarrito}>
              <div>
                <strong>{item.nombre}</strong>
                <p>{formatMoney(itemSubtotal(item), menu.negocio.moneda)}</p>
              </div>
              <QuantityCounter
                label={item.nombre}
                min={1}
                value={item.cantidad}
                onChange={(quantity) => onQuantityChange(item.idCarrito, quantity)}
              />
              <button type="button" className="link danger" onClick={() => onRemove(item.idCarrito)}>
                Eliminar
              </button>
            </article>
          ))}
        </section>
      )}

      <NutritionTotals totals={totals} currency={menu.negocio.moneda} />
      <MacroChart nutrition={totals.nutrition} />

      <CustomerForm customer={customer} setCustomer={setCustomer} errors={errors} />

      <section className="request-card">
        <div className={orderingStatus.isOpen ? "order-window open" : "order-window closed"}>
          <strong>{orderingStatus.isOpen ? "Horario abierto" : "Horario cerrado"}</strong>
          <span>{orderingStatus.message}</span>
          <small>Hora detectada: {orderingStatus.currentLabel}</small>
        </div>
        <div className="delivery-note">
          <strong>Pedidos y entrega</strong>
          <span>
            Los pedidos se toman antes de las 12:00 p. m. Podemos enviar un mandadito a dejar la
            comida o puedes mandar tu mandadito de confianza. Todos los pagos son por transferencia.
          </span>
        </div>
        <button
          type="button"
          className="primary request"
          onClick={onRequestOrder}
        >
          Solicitar pedido
        </button>
        <button type="button" className="secondary request" onClick={onSaveBasket} disabled={cart.length === 0}>
          Guardar en canasta
        </button>
        <p>
          Esto abrira WhatsApp y enviara a nuestro numero el resumen de tu pedido, sus cantidades,
          indicaciones y precio total.
        </p>
        {customer.entrega && (
          <small>Entrega seleccionada: {readableDelivery(customer.entrega)}</small>
        )}
      </section>
    </section>
  );
}
