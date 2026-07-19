import { useMemo, useState } from "react";
import { createDishCartItem, getDishDetails } from "../utils/calculations";
import { formatMacro, formatMoney, joinNames } from "../utils/formatters";

const prepState = (ingredients) =>
  ingredients.reduce((state, ingredient) => ({ ...state, [ingredient]: true }), {});

const defaultDish = (menu) => {
  const protein = menu.proteinas[0];
  return {
    proteina: protein.id,
    gramosProteina: protein.porcionBaseGramos || undefined,
    huevos: protein.huevosBase || undefined,
    yemas: protein.huevosBase || undefined,
    carbohidrato: "",
    verduras: [],
    grasa: "",
    ensalada: "",
    ingredientesPreparacion: prepState(menu.configuracion.ingredientesPorDefecto),
    picante: false,
    extraCarbohidrato: false,
    extraGrasa: false,
    extraEnsalada: false,
    ketoFriendly: false
  };
};

function MacroPie({ nutrition }) {
  const proteinCalories = nutrition.proteina * 4;
  const carbCalories = nutrition.carbohidratos * 4;
  const fatCalories = nutrition.grasas * 9;
  const total = proteinCalories + carbCalories + fatCalories || 1;
  const proteinEnd = (proteinCalories / total) * 100;
  const carbEnd = proteinEnd + (carbCalories / total) * 100;
  const style = {
    background: `conic-gradient(#12a7b9 0 ${proteinEnd}%, #58d7a7 ${proteinEnd}% ${carbEnd}%, #f7d660 ${carbEnd}% 100%)`
  };

  return (
    <div className="dish-pie-wrap" aria-label="Grafica circular de macros del plato">
      <div className="dish-pie" style={style}>
        <span>{formatMacro(nutrition.calorias, "kcal")}</span>
      </div>
      <div className="pie-legend">
        <span className="protein">Proteina</span>
        <span className="carbs">Carbs</span>
        <span className="fats">Grasas</span>
      </div>
    </div>
  );
}

function ChoiceGroup({ title, options, value, onChange, disabledIds = [] }) {
  return (
    <section className="builder-block">
      <h3>{title}</h3>
      <div className="choice-grid">
        {options.map((option) => {
          const disabled = disabledIds.includes(option.id);
          return (
            <button
              type="button"
              key={option.id}
              className={value === option.id ? "choice selected" : "choice"}
              disabled={disabled}
              onClick={() => onChange(option.id)}
            >
              <strong>{option.nombre}</strong>
              {option.porcion && <span>{option.porcion}</span>}
              {option.descripcion && <span>{option.descripcion}</span>}
              {disabled && <small>No keto</small>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function DishBuilder({ menu, editingDish, onCancel, onSave }) {
  const [configuration, setConfiguration] = useState(() =>
    editingDish
      ? {
          ...defaultDish(menu),
          ...editingDish.configuracion,
          ingredientesPreparacion: {
            ...prepState(menu.configuracion.ingredientesPorDefecto),
            ...editingDish.configuracion.ingredientesPreparacion
          },
          picante: Boolean(editingDish.configuracion.picante),
          extraCarbohidrato: Boolean(editingDish.configuracion.extraCarbohidrato),
          extraGrasa: Boolean(editingDish.configuracion.extraGrasa),
          extraEnsalada: Boolean(editingDish.configuracion.extraEnsalada)
        }
      : defaultDish(menu)
  );
  const [error, setError] = useState("");
  const selectedProtein = menu.proteinas.find((item) => item.id === configuration.proteina);
  const details = useMemo(() => getDishDetails(menu, configuration), [menu, configuration]);

  const setProtein = (proteinId) => {
    const protein = menu.proteinas.find((item) => item.id === proteinId);
    setConfiguration((current) => ({
      ...current,
      proteina: proteinId,
      gramosProteina: protein.tipoPorcion === "gramos" ? protein.porcionBaseGramos : undefined,
      huevos: protein.tipoPorcion === "huevos" ? protein.huevosBase : undefined,
      yemas: protein.tipoPorcion === "huevos" ? protein.huevosBase : undefined
    }));
  };

  const toggleVegetable = (vegetableId) => {
    setConfiguration((current) => {
      return {
        ...current,
        verduras: current.verduras.includes(vegetableId)
          ? current.verduras.filter((id) => id !== vegetableId)
          : [...current.verduras, vegetableId]
      };
    });
  };

  const setKetoMode = (enabled) => {
    setConfiguration((current) => ({
      ...current,
      ketoFriendly: enabled,
      carbohidrato: enabled ? "sin-carbohidrato" : current.carbohidrato,
      extraCarbohidrato: enabled ? false : current.extraCarbohidrato
    }));
  };

  const validate = () => {
    if (!configuration.proteina) return "Selecciona el tipo de carne o proteina principal.";
    if (!configuration.carbohidrato) return "Selecciona un carbohidrato o la opcion sin carbohidrato.";
    if (!configuration.grasa) return "Selecciona una grasa o la opcion sin grasa adicional.";
    if (!configuration.ensalada) return "Selecciona una ensalada o la opcion sin ensalada.";
    if (menu.configuracion.verdurasObligatorias && configuration.verduras.length === 0) {
      return "Selecciona al menos una verdura.";
    }
    return "";
  };

  const saveDish = () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    const item = createDishCartItem(menu, configuration, editingDish?.idCarrito, editingDish?.cantidad || 1);
    onSave(item);
  };

  const changeProteinGrams = (direction) => {
    const step = menu.configuracion.incrementoProteinaGramos;
    const next = configuration.gramosProteina + direction * step;
    setConfiguration((current) => ({
      ...current,
      gramosProteina: Math.min(
        Math.max(next, selectedProtein.porcionBaseGramos),
        menu.configuracion.maximoProteinaGramos
      )
    }));
  };

  const changeEggs = (direction) => {
    const next = Math.min(
      Math.max(configuration.huevos + direction, selectedProtein.huevosBase),
      selectedProtein.maximoHuevos
    );
    setConfiguration((current) => ({
      ...current,
      huevos: next,
      yemas: Math.min(current.yemas, next)
    }));
  };

  return (
    <div className="builder glass-section">
      <div className="builder-head">
        <div>
          <p className="eyebrow">{editingDish ? "Editar plato" : "Nuevo plato"}</p>
          <h2>Arma tu plato fuerte</h2>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={configuration.ketoFriendly}
            onChange={(event) => setKetoMode(event.target.checked)}
          />
          <span>Keto friendly</span>
        </label>
      </div>

      <ChoiceGroup
        title="Tipo de carne o proteina principal"
        options={menu.proteinas}
        value={configuration.proteina}
        onChange={setProtein}
      />

      {selectedProtein?.tipoPorcion === "huevos" ? (
        <section className="builder-block counter-card">
          <div>
            <h3>Cantidad de huevos</h3>
            <p>Base: {selectedProtein.huevosBase} huevos · Extra: {configuration.huevos - selectedProtein.huevosBase}</p>
          </div>
          <div className="protein-counter">
            <button type="button" onClick={() => changeEggs(-1)} disabled={configuration.huevos <= selectedProtein.huevosBase}>
              -
            </button>
            <strong>{configuration.huevos} huevos</strong>
            <button type="button" onClick={() => changeEggs(1)} disabled={configuration.huevos >= selectedProtein.maximoHuevos}>
              +
            </button>
          </div>
          <label className="range-label">
            Yemas que deseas incluir: <strong>{configuration.yemas}</strong>
            <input
              type="range"
              min="0"
              max={configuration.huevos}
              value={configuration.yemas}
              onChange={(event) =>
                setConfiguration((current) => ({ ...current, yemas: Number(event.target.value) }))
              }
            />
          </label>
        </section>
      ) : (
        <section className="builder-block counter-card">
          <div>
            <h3>Cantidad de carne o proteina principal</h3>
            <p>
              Porcion base: {selectedProtein.porcionBaseGramos} g · Extra agregado:{" "}
              {configuration.gramosProteina - selectedProtein.porcionBaseGramos} g
            </p>
          </div>
          <div className="protein-counter">
            <button
              type="button"
              onClick={() => changeProteinGrams(-1)}
              disabled={configuration.gramosProteina <= selectedProtein.porcionBaseGramos}
            >
              -
            </button>
            <strong>{configuration.gramosProteina} g</strong>
            <button
              type="button"
              onClick={() => changeProteinGrams(1)}
              disabled={configuration.gramosProteina >= menu.configuracion.maximoProteinaGramos}
            >
              +
            </button>
          </div>
        </section>
      )}

      <ChoiceGroup
        title="Carbohidrato"
        options={menu.carbohidratos}
        value={configuration.carbohidrato}
        disabledIds={configuration.ketoFriendly ? menu.carbohidratos.filter((item) => !item.ketoFriendly).map((item) => item.id) : []}
        onChange={(id) =>
          setConfiguration((current) => ({
            ...current,
            carbohidrato: id,
            extraCarbohidrato: id === "sin-carbohidrato" ? false : current.extraCarbohidrato
          }))
        }
      />

      <section className="builder-block">
        <h3>Verduras</h3>
        <div className="choice-grid">
          {menu.verduras.map((vegetable) => (
            <button
              type="button"
              key={vegetable.id}
              className={configuration.verduras.includes(vegetable.id) ? "choice selected" : "choice"}
              onClick={() => toggleVegetable(vegetable.id)}
            >
              <strong>{vegetable.nombre}</strong>
            </button>
          ))}
        </div>
      </section>

      <ChoiceGroup
        title="Grasa"
        options={menu.grasas}
        value={configuration.grasa}
        onChange={(id) =>
          setConfiguration((current) => ({
            ...current,
            grasa: id,
            extraGrasa: id === "sin-grasa" ? false : current.extraGrasa
          }))
        }
      />

      <ChoiceGroup
        title="Ensalada"
        options={menu.ensaladas}
        value={configuration.ensalada}
        onChange={(id) =>
          setConfiguration((current) => ({
            ...current,
            ensalada: id,
            extraEnsalada: id === "sin-ensalada" ? false : current.extraEnsalada
          }))
        }
      />

      <section className="builder-block prep-options">
        <h3>Extras del plato</h3>
        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={Boolean(configuration.extraCarbohidrato)}
              disabled={!configuration.carbohidrato || configuration.carbohidrato === "sin-carbohidrato"}
              onChange={(event) =>
                setConfiguration((current) => ({ ...current, extraCarbohidrato: event.target.checked }))
              }
            />
            {menu.configuracion.extraCarbohidrato.nombre} +{formatMoney(menu.configuracion.extraCarbohidrato.precioExtra, menu.negocio.moneda)}
          </label>
          <label>
            <input
              type="checkbox"
              checked={Boolean(configuration.extraGrasa)}
              disabled={!configuration.grasa || configuration.grasa === "sin-grasa"}
              onChange={(event) =>
                setConfiguration((current) => ({ ...current, extraGrasa: event.target.checked }))
              }
            />
            {menu.configuracion.extraGrasa.nombre} +{formatMoney(menu.configuracion.extraGrasa.precioExtra, menu.negocio.moneda)}
          </label>
          <label>
            <input
              type="checkbox"
              checked={Boolean(configuration.extraEnsalada)}
              disabled={!configuration.ensalada || configuration.ensalada === "sin-ensalada"}
              onChange={(event) =>
                setConfiguration((current) => ({ ...current, extraEnsalada: event.target.checked }))
              }
            />
            {menu.configuracion.extraEnsalada.nombre} +{formatMoney(menu.configuracion.extraEnsalada.precioExtra, menu.negocio.moneda)}
          </label>
        </div>
      </section>

      <section className="builder-block prep-options">
        <h3>Preparacion</h3>
        <div className="checkbox-row">
          {Object.entries(configuration.ingredientesPreparacion).map(([ingredient, selected]) => (
            <label key={ingredient}>
              <input
                type="checkbox"
                checked={selected}
                onChange={(event) =>
                  setConfiguration((current) => ({
                    ...current,
                    ingredientesPreparacion: {
                      ...current.ingredientesPreparacion,
                      [ingredient]: event.target.checked
                    }
                  }))
                }
              />
              {ingredient}
            </label>
          ))}
          <label>
            <input
              type="checkbox"
              checked={Boolean(configuration.picante)}
              onChange={(event) =>
                setConfiguration((current) => ({ ...current, picante: event.target.checked }))
              }
            />
            {menu.configuracion.picante.nombre}
          </label>
        </div>
        <p>Cocinado en freidora de aire.</p>
        <p>Sazonado con sal, ajo, sazonador universal y pimienta.</p>
      </section>

      <section className="preview-card">
        <div>
          <p className="eyebrow">Vista previa</p>
          <h3>{details.protein?.nombre || "Plato"}</h3>
          <p>{joinNames(details.vegetables.map((item) => item.nombre))}</p>
        </div>
        <MacroPie nutrition={details.nutrition} />
        <div className="macro-grid">
          <span>{formatMacro(details.nutrition.calorias, "kcal")}</span>
          <span>{formatMacro(details.nutrition.proteina, "g proteina")}</span>
          <span>{formatMacro(details.nutrition.carbohidratos, "g carbs")}</span>
          <span>{formatMacro(details.nutrition.grasas, "g grasas")}</span>
        </div>
        <strong className="price">{formatMoney(details.price, menu.negocio.moneda)}</strong>
      </section>

      {error && <p className="form-error">{error}</p>}

      <div className="button-row">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="primary" onClick={saveDish}>
          {editingDish ? "Guardar cambios" : "Agregar plato al pedido"}
        </button>
      </div>
    </div>
  );
}
