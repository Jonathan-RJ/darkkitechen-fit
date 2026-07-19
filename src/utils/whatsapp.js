import { cartTotals, getDishDetails, itemSubtotal } from "./calculations";
import { formatMoney, formatMacro, formatDateTime, joinNames, titleCase } from "./formatters";
import { getOrderingStatus } from "./orderWindow";

const line = (label, value) => `${label}: ${value}`;
const separator = "------------------------------";

export const validateOrder = (cart, customer, appConfig, date = new Date()) => {
  const errors = {};
  const orderingStatus = getOrderingStatus(appConfig, date);
  if (cart.length === 0) errors.cart = "Agrega al menos un producto al pedido.";
  if (!orderingStatus.isOpen) errors.horario = orderingStatus.message;
  if (!customer.nombre.trim()) errors.nombre = "Escribe tu nombre.";
  if (!customer.entrega) errors.entrega = "Selecciona el metodo de entrega.";
  if (customer.entrega === "domicilio" && !customer.direccion.trim()) {
    errors.direccion = "Escribe la direccion de entrega.";
  }
  if (!customer.hora.trim()) errors.hora = "Indica la hora solicitada.";
  return errors;
};

export const buildWhatsAppMessage = (menu, cart, customer, orderDate) => {
  const totals = cartTotals(cart);
  const dishes = cart.filter((item) => item.tipo === "plato");
  const drinks = cart.filter((item) => item.tipo === "bebida");
  const desserts = cart.filter((item) => item.tipo === "postre");
  const text = [];

  text.push(`Hola ${menu.negocio.nombre}, quiero solicitar este pedido:`);
  text.push(separator);
  text.push(`Fecha del pedido: ${formatDateTime(orderDate)}`);
  text.push(
    "Les comparto el resumen completo con cantidades, indicaciones, macros estimados y total. Quedo pendiente de confirmacion para prepararlo."
  );
  text.push(separator, "");
  text.push("CLIENTE");
  text.push(separator);
  text.push(line("Nombre", customer.nombre));
  text.push(line("Entrega", customer.entrega === "domicilio" ? "Entrega a domicilio" : "Recoleccion"));
  if (customer.entrega === "domicilio") text.push(line("Direccion", customer.direccion));
  if (customer.entrega === "domicilio") {
    text.push(
      "Nota de entrega: Pueden enviar un mandadito a dejar la comida o puedo mandar mi mandadito de confianza."
    );
  }
  text.push("Nota de pedidos: Los pedidos se toman antes de las 12:00 p. m.");
  text.push(line("Hora solicitada", customer.hora));
  text.push(line("Metodo de pago", "Transferencia"));

  if (dishes.length) {
    text.push("", separator, "PLATOS FUERTES", separator);
    dishes.forEach((item, index) => {
      const details = getDishDetails(menu, item.configuracion);
      const prep = item.configuracion.ingredientesPreparacion;
      text.push("", `${index + 1}. ${details.protein.nombre}, ${details.proteinTotals.label}`);
      text.push(line("Cantidad", item.cantidad));
      text.push("");
      text.push(`- Tipo de carne/proteina: ${details.protein.nombre}`);
      text.push(`- Porcion base de carne/proteina: ${details.proteinTotals.baseLabel}`);
      text.push(`- Extra de carne/proteina por unidad: ${details.proteinTotals.extraLabel}`);
      text.push(
        `- Carbohidrato: ${details.carb.nombre}${
          details.hasExtraCarb
            ? ` + extra (${formatMoney(
                menu.configuracion.extraCarbohidrato.precioExtra,
                menu.negocio.moneda
              )})`
            : ""
        }`
      );
      text.push(`- Verduras: ${joinNames(details.vegetables.map((veg) => veg.nombre))}`);
      text.push(
        `- Grasa: ${details.fat.nombre}${details.fat.descripcion ? ` (${details.fat.descripcion})` : ""}${
          details.hasExtraFat
            ? ` + extra (${formatMoney(menu.configuracion.extraGrasa.precioExtra, menu.negocio.moneda)})`
            : ""
        }`
      );
      text.push(
        `- Ensalada: ${details.salad.nombre}${
          details.hasExtraSalad
            ? ` + extra (${formatMoney(menu.configuracion.extraEnsalada.precioExtra, menu.negocio.moneda)})`
            : ""
        }`
      );
      Object.entries(prep).forEach(([ingredient, selected]) => {
        text.push(`- ${selected ? "Con" : "Sin"} ${ingredient.toLowerCase()}`);
      });
      text.push(
        item.configuracion.picante
          ? `- ${menu.configuracion.picante.nombre}`
          : "- Sin chiles en escabeche"
      );
      text.push(`- Cocinado en ${menu.configuracion.metodoCoccion.toLowerCase()}`);
      text.push(`- Sazonado con ${menu.configuracion.sazonado.join(", ").toLowerCase()}`);
      text.push("", "Nutricion por unidad:");
      text.push(`- ${formatMacro(item.nutricion.calorias, "kcal")}`);
      text.push(`- ${formatMacro(item.nutricion.proteina, "g proteina")}`);
      text.push(`- ${formatMacro(item.nutricion.carbohidratos, "g carbohidratos")}`);
      text.push(`- ${formatMacro(item.nutricion.grasas, "g grasas")}`);
      text.push("", "Subtotal:");
      text.push(formatMoney(itemSubtotal(item), menu.negocio.moneda));
      text.push(separator);
    });
  }

  if (drinks.length) {
    text.push("", "BEBIDAS", separator);
    drinks.forEach((item) => text.push(`- ${item.nombre} x${item.cantidad}`));
  }

  if (desserts.length) {
    text.push("", "POSTRES", separator);
    desserts.forEach((item) => text.push(`- ${item.nombre} x${item.cantidad}`));
  }

  text.push("", separator, "TOTALES ESTIMADOS", separator);
  text.push(`- Productos: ${totals.products}`);
  text.push(`- Calorias: ${formatMacro(totals.nutrition.calorias, "kcal")}`);
  text.push(`- Proteina: ${formatMacro(totals.nutrition.proteina, "g")}`);
  text.push(`- Carbohidratos: ${formatMacro(totals.nutrition.carbohidratos, "g")}`);
  text.push(`- Grasas: ${formatMacro(totals.nutrition.grasas, "g")}`);
  text.push("", "TOTAL DEL PEDIDO");
  text.push(formatMoney(totals.money, menu.negocio.moneda));

  if (customer.notas.trim()) {
    text.push("", separator, "NOTAS", separator, customer.notas.trim());
  }

  text.push("", separator, "Quedo pendiente de la confirmacion del pedido.");
  return text.join("\n");
};

export const buildWhatsAppUrl = (menu, message) =>
  `https://wa.me/${menu.negocio.numeroWhatsApp}?text=${encodeURIComponent(message)}`;

export const readableDelivery = (value) =>
  value === "domicilio" ? "Entrega a domicilio" : titleCase(value || "");
