import { joinNames, roundMacro } from "./formatters";

export const emptyNutrition = {
  calorias: 0,
  proteina: 0,
  carbohidratos: 0,
  grasas: 0
};

export const createCartId = (prefix = "item") => {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const byId = (items, id) => items.find((item) => item.id === id);

export const addNutrition = (...values) =>
  values.reduce(
    (total, value = emptyNutrition) => {
      const item = value || emptyNutrition;
      return {
      calorias: total.calorias + (Number(item.calorias) || 0),
      proteina: total.proteina + (Number(item.proteina) || 0),
      carbohidratos: total.carbohidratos + (Number(item.carbohidratos) || 0),
      grasas: total.grasas + (Number(item.grasas) || 0)
    };
    },
    { ...emptyNutrition }
  );

export const scaleNutrition = (nutrition, quantity = 1) => ({
  calorias: roundMacro((nutrition?.calorias || 0) * quantity),
  proteina: roundMacro((nutrition?.proteina || 0) * quantity),
  carbohidratos: roundMacro((nutrition?.carbohidratos || 0) * quantity),
  grasas: roundMacro((nutrition?.grasas || 0) * quantity)
});

export const calculateProtein = (protein, config, appConfig) => {
  if (!protein) return { nutrition: { ...emptyNutrition }, price: 0, label: "" };

  if (protein.tipoPorcion === "huevos") {
    const eggs = Number(config.huevos) || protein.huevosBase;
    const yolks = Math.min(Number(config.yemas) || 0, eggs);
    const whites = Math.max(eggs - yolks, 0);
    const nutrition = addNutrition(
      scaleNutrition(protein.nutricionPorClara, whites),
      scaleNutrition(protein.nutricionPorYema, yolks)
    );
    const extraEggs = Math.max(eggs - protein.huevosBase, 0);
    return {
      nutrition,
      price: protein.precioBase + extraEggs * protein.precioExtraPorHuevo,
      label: `${eggs} huevos, ${yolks} yemas`,
      baseLabel: `${protein.huevosBase} huevos`,
      extraLabel: `${extraEggs} huevos`
    };
  }

  const grams = Number(config.gramosProteina) || protein.porcionBaseGramos;
  const multiplier = grams / 100;
  const nutrition = scaleNutrition(protein.nutricionPor100Gramos, multiplier);
  const increments = Math.max(
    0,
    (grams - protein.porcionBaseGramos) / appConfig.incrementoProteinaGramos
  );

  return {
    nutrition,
    price: protein.precioBase + increments * protein.precioExtraPorIncremento,
    label: `${grams} g`,
    baseLabel: `${protein.porcionBaseGramos} g`,
    extraLabel: `${Math.max(grams - protein.porcionBaseGramos, 0)} g`
  };
};

export const getDishDetails = (menu, configuration) => {
  const protein = byId(menu.proteinas, configuration.proteina);
  const carb = byId(menu.carbohidratos, configuration.carbohidrato);
  const fat = byId(menu.grasas, configuration.grasa);
  const salad = byId(menu.ensaladas, configuration.ensalada);
  const vegetables = configuration.verduras
    .map((id) => byId(menu.verduras, id))
    .filter(Boolean);
  const prepIngredients = Object.entries(configuration.ingredientesPreparacion || {})
    .filter(([, selected]) => selected)
    .map(([name]) => ({
      nombre: name,
      ...menu.configuracion.ingredientesPreparacionNutricion?.[name]
    }))
    .filter((item) => item.nutricion);
  const hasExtraFat = Boolean(configuration.extraGrasa && fat && fat.id !== "sin-grasa");
  const hasExtraSalad = Boolean(configuration.extraEnsalada && salad && salad.id !== "sin-ensalada");
  const hasExtraCarb = Boolean(configuration.extraCarbohidrato && carb && carb.id !== "sin-carbohidrato");

  const proteinTotals = calculateProtein(protein, configuration, menu.configuracion);
  const nutrition = addNutrition(
    proteinTotals.nutrition,
    carb?.nutricion,
    hasExtraCarb ? carb?.nutricion : null,
    fat?.nutricion,
    hasExtraFat ? fat?.nutricion : null,
    salad?.nutricion,
    hasExtraSalad ? salad?.nutricion : null,
    ...vegetables.map((item) => item.nutricion),
    ...prepIngredients.map((item) => item.nutricion)
  );

  const price =
    proteinTotals.price +
    (carb?.precio || 0) +
    (fat?.precio || 0) +
    (salad?.precio || 0) +
    vegetables.reduce((sum, item) => sum + (item.precio || 0), 0) +
    (configuration.picante ? menu.configuracion.picante?.precioExtra || 0 : 0) +
    (hasExtraCarb ? menu.configuracion.extraCarbohidrato?.precioExtra || 0 : 0) +
    (hasExtraFat ? menu.configuracion.extraGrasa?.precioExtra || 0 : 0) +
    (hasExtraSalad ? menu.configuracion.extraEnsalada?.precioExtra || 0 : 0);

  return {
    protein,
    carb,
    fat,
    salad,
    vegetables,
    prepIngredients,
    hasExtraFat,
    hasExtraSalad,
    hasExtraCarb,
    proteinTotals,
    nutrition: scaleNutrition(nutrition, 1),
    price
  };
};

export const createDishCartItem = (menu, configuration, existingId, quantity = 1) => {
  const details = getDishDetails(menu, configuration);
  return {
    idCarrito: existingId || createCartId("plato"),
    tipo: "plato",
    cantidad: quantity,
    configuracion: configuration,
    nutricion: details.nutrition,
    precioUnitario: details.price
  };
};

export const createSimpleCartItem = (type, product, quantity, extra = null) => {
  const nutrition = extra ? addNutrition(product.nutricion, extra.nutricion) : product.nutricion;
  const price = product.precio + (extra?.precio || 0);
  return {
    idCarrito: createCartId(type),
    tipo: type,
    cantidad: quantity,
    productoId: product.id,
    nombre: extra ? `${product.nombre} + 10 g de proteina` : product.nombre,
    ingredientes: product.ingredientes || [],
    descripcion: product.descripcion || "",
    configuracion: extra ? { extraProteina: true } : { extraProteina: false },
    nutricion: scaleNutrition(nutrition, 1),
    precioUnitario: price
  };
};

export const itemSubtotal = (item) => item.precioUnitario * item.cantidad;

export const itemTotalNutrition = (item) => scaleNutrition(item.nutricion, item.cantidad);

export const cartTotals = (cart) => {
  const nutrition = cart.reduce(
    (total, item) => addNutrition(total, itemTotalNutrition(item)),
    { ...emptyNutrition }
  );

  return {
    products: cart.reduce((sum, item) => sum + item.cantidad, 0),
    nutrition: scaleNutrition(nutrition, 1),
    money: cart.reduce((sum, item) => sum + itemSubtotal(item), 0)
  };
};

export const getDishLabel = (menu, item) => {
  const details = getDishDetails(menu, item.configuracion);
  const omitted = Object.entries(item.configuracion.ingredientesPreparacion)
    .filter(([, selected]) => !selected)
    .map(([name]) => `Sin ${name.toLowerCase()}`);
  const spicy = item.configuracion.picante ? menu.configuracion.picante?.nombre || "Chiles en escabeche" : "";
  const extraFat = details.hasExtraFat ? "Extra de grasa" : "";
  const extraSalad = details.hasExtraSalad ? "Extra de ensalada" : "";
  const extraCarb = details.hasExtraCarb ? "Extra de carbohidrato" : "";
  return {
    title: details.protein?.nombre || "Plato",
    subtitle: [
      details.protein?.nombre && details.proteinTotals.label,
      details.carb?.nombre,
      extraCarb,
      joinNames(details.vegetables.map((veg) => veg.nombre)),
      details.fat?.nombre,
      details.salad?.nombre,
      extraFat,
      extraSalad,
      spicy,
      omitted.join(", ")
    ]
      .filter(Boolean)
      .join(" · "),
    details
  };
};
