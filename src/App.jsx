import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import menu from "./data/menu.json";
import CartPanel from "./components/CartPanel";
import DessertsStep from "./components/DessertsStep";
import DrinksStep from "./components/DrinksStep";
import Header from "./components/Header";
import HowWePrepare from "./components/HowWePrepare";
import MainDishStep from "./components/MainDishStep";
import OrderSummary from "./components/OrderSummary";
import StepIndicator from "./components/StepIndicator";
import { cartTotals, createDishCartItem, createSimpleCartItem } from "./utils/calculations";
import { formatMoney } from "./utils/formatters";
import { clearOrder, loadOrder, saveOrder } from "./utils/storage";
import { buildWhatsAppMessage, buildWhatsAppUrl, validateOrder } from "./utils/whatsapp";
import { getOrderingStatus } from "./utils/orderWindow";

const emptyCustomer = {
  nombre: "",
  entrega: "",
  direccion: "",
  hora: "",
  pago: "Transferencia",
  notas: ""
};

export default function App() {
  const saved = useMemo(() => loadOrder(), []);
  const [currentStep, setCurrentStep] = useState(saved?.currentStep || 0);
  const [cart, setCart] = useState(saved?.cart || []);
  const [customer, setCustomer] = useState(() => ({
    ...emptyCustomer,
    ...(saved?.customer || {}),
    pago: "Transferencia"
  }));
  const [orderDate, setOrderDate] = useState(saved?.orderDate || new Date().toISOString());
  const [now, setNow] = useState(() => new Date());
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [errors, setErrors] = useState({});
  const totals = cartTotals(cart);

  useEffect(() => {
    saveOrder({ currentStep, cart, customer, orderDate });
  }, [currentStep, cart, customer, orderDate]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const removeItem = async (id) => {
    const item = cart.find((cartItem) => cartItem.idCarrito === id);
    if (!item) return;
    const result = await Swal.fire({
      title: "Eliminar producto",
      text: `Quieres quitar ${item.nombre || "este plato"} de tu canasta?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#087f8f",
      cancelButtonColor: "#5d7278",
      background: "rgba(255, 255, 255, 0.94)"
    });

    if (result.isConfirmed) {
      setCart((current) => current.filter((cartItem) => cartItem.idCarrito !== id));
      Swal.fire({
        title: "Listo",
        text: "Producto eliminado de la canasta.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        background: "rgba(255, 255, 255, 0.94)"
      });
    }
  };

  const clearCart = async () => {
    const result = await Swal.fire({
      title: "Vaciar canasta",
      text: "Quieres quitar todos los productos guardados?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, vaciar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#087f8f",
      cancelButtonColor: "#5d7278",
      background: "rgba(255, 255, 255, 0.94)"
    });

    if (result.isConfirmed) {
      setCart([]);
      clearOrder();
      Swal.fire({
        title: "Canasta vacia",
        text: "Tu pedido guardado se limpio.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        background: "rgba(255, 255, 255, 0.94)"
      });
    }
  };

  const openBuilder = () => {
    setEditingDish(null);
    setBuilderOpen(true);
    setCurrentStep(0);
  };

  const editDish = (dish) => {
    setEditingDish(dish);
    setBuilderOpen(true);
    setCurrentStep(0);
  };

  const saveDish = (dish) => {
    setCart((current) => {
      const exists = current.some((item) => item.idCarrito === dish.idCarrito);
      return exists
        ? current.map((item) => (item.idCarrito === dish.idCarrito ? dish : item))
        : [...current, dish];
    });
    setBuilderOpen(false);
    setEditingDish(null);
    setErrors({});
  };

  const duplicateDish = (dish) => {
    const duplicate = createDishCartItem(menu, dish.configuracion, null, 1);
    setCart((current) => [...current, duplicate]);
    Swal.fire({
      title: "Plato duplicado",
      text: "Agregamos una copia a tu canasta.",
      icon: "success",
      timer: 1300,
      showConfirmButton: false,
      background: "rgba(255, 255, 255, 0.94)"
    });
  };

  const setSimpleQuantity = (type, product, quantity, extraProtein = false) => {
    const extra = type === "postre" && extraProtein ? menu.extraProteinaPostre : null;
    setCart((current) => {
      const existing = current.find(
        (item) =>
          item.tipo === type &&
          item.productoId === product.id &&
          Boolean(item.configuracion.extraProteina) === Boolean(extraProtein)
      );

      if (quantity <= 0) {
        return current.filter((item) => item.idCarrito !== existing?.idCarrito);
      }

      if (existing) {
        return current.map((item) =>
          item.idCarrito === existing.idCarrito ? { ...item, cantidad: quantity } : item
        );
      }

      return [...current, createSimpleCartItem(type, product, quantity, extra)];
    });
  };

  const changeQuantity = (id, quantity) => {
    setCart((current) =>
      current.map((item) => (item.idCarrito === id ? { ...item, cantidad: quantity } : item))
    );
  };

  const saveBasket = () => {
    saveOrder({ currentStep, cart, customer, orderDate });
    Swal.fire({
      title: "Canasta guardada",
      text: "Tu carrito queda guardado en este dispositivo para retomarlo despues.",
      icon: "success",
      confirmButtonText: "Perfecto",
      confirmButtonColor: "#087f8f",
      background: "rgba(255, 255, 255, 0.94)"
    });
  };

  const requestOrder = async () => {
    const validation = validateOrder(cart, customer, menu.configuracion, new Date());
    setErrors(validation);
    if (validation.horario) {
      Swal.fire({
        title: "Fuera de horario",
        text: validation.horario,
        icon: "info",
        confirmButtonText: "Guardar en canasta",
        confirmButtonColor: "#087f8f",
        background: "rgba(255, 255, 255, 0.94)"
      }).then(() => saveBasket());
      return;
    }

    if (Object.keys(validation).length > 0) {
      Swal.fire({
        title: "Faltan datos",
        text: "Revisa los campos marcados para poder solicitar tu pedido.",
        icon: "warning",
        confirmButtonText: "Revisar",
        confirmButtonColor: "#087f8f",
        background: "rgba(255, 255, 255, 0.94)"
      });
      return;
    }

    const result = await Swal.fire({
      title: "Deseas solicitar este pedido?",
      text: "Se abrira WhatsApp con el resumen completo. El pedido queda pendiente de confirmacion.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Abrir WhatsApp",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#087f8f",
      cancelButtonColor: "#5d7278",
      background: "rgba(255, 255, 255, 0.94)"
    });

    if (result.isConfirmed) openWhatsApp();
  };

  const openWhatsApp = () => {
    const message = buildWhatsAppMessage(menu, cart, customer, orderDate);
    window.open(buildWhatsAppUrl(menu, message), "_blank", "noopener,noreferrer");
    setCart([]);
    setCustomer(emptyCustomer);
    setCurrentStep(0);
    setErrors({});
    setBuilderOpen(false);
    setEditingDish(null);
    setOrderDate(new Date().toISOString());
  };

  return (
    <div className="app-shell">
      <Header menu={menu} />
      <StepIndicator currentStep={currentStep} setCurrentStep={setCurrentStep} />

      <main className="layout">
        <div className="main-column">
          {currentStep === 0 && (
            <MainDishStep
              menu={menu}
              cart={cart}
              builderOpen={builderOpen}
              editingDish={editingDish}
              onOpenBuilder={openBuilder}
              onCancelBuilder={() => {
                setBuilderOpen(false);
                setEditingDish(null);
              }}
              onSaveDish={saveDish}
              onEditDish={editDish}
              onDuplicateDish={duplicateDish}
              onRemove={removeItem}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 1 && (
            <DrinksStep
              menu={menu}
              cart={cart}
              onSetSimpleQuantity={setSimpleQuantity}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 2 && (
            <DessertsStep
              menu={menu}
              cart={cart}
              onSetSimpleQuantity={setSimpleQuantity}
              setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 3 && (
            <OrderSummary
              menu={menu}
              cart={cart}
              customer={customer}
              setCustomer={setCustomer}
              orderDate={orderDate}
              orderingStatus={getOrderingStatus(menu.configuracion, now)}
              errors={errors}
              onEditDish={editDish}
              onRemove={removeItem}
              onQuantityChange={changeQuantity}
              onRequestOrder={requestOrder}
              onSaveBasket={saveBasket}
              setCurrentStep={setCurrentStep}
            />
          )}
          <HowWePrepare menu={menu} />
        </div>

        <CartPanel
          menu={menu}
          cart={cart}
          onEditDish={editDish}
          onDuplicateDish={duplicateDish}
          onRemove={removeItem}
          onClear={clearCart}
          setCurrentStep={setCurrentStep}
        />
      </main>

      <div className="mobile-bar">
        <span>Productos: {totals.products}</span>
        <strong>Total: {formatMoney(totals.money, menu.negocio.moneda)}</strong>
        <button type="button" onClick={() => setCurrentStep(3)}>
          Ver pedido
        </button>
      </div>
    </div>
  );
}
