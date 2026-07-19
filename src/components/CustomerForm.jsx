export default function CustomerForm({ customer, setCustomer, errors }) {
  const update = (field, value) => setCustomer((current) => ({ ...current, [field]: value }));

  return (
    <section className="customer-form glass-section">
      <div>
        <p className="eyebrow">Datos del cliente</p>
        <h2>Informacion para solicitar</h2>
        <p className="form-note">
          Todos los pagos son por transferencia. Los pedidos se toman de 7:00 a. m. a 12:00 p. m.;
          dinos a que hora lo deseas.
        </p>
      </div>

      <div className="form-grid">
        <label>
          Nombre
          <input value={customer.nombre} onChange={(event) => update("nombre", event.target.value)} />
          {errors.nombre && <span className="form-error">{errors.nombre}</span>}
        </label>

        <label>
          Metodo de entrega
          <select value={customer.entrega} onChange={(event) => update("entrega", event.target.value)}>
            <option value="">Selecciona una opcion</option>
            <option value="recoger">Recoger</option>
            <option value="domicilio">Entrega a domicilio</option>
          </select>
          <small className="field-help">
            Para domicilio podemos enviar un mandadito o puedes mandar tu mandadito de confianza.
          </small>
          {errors.entrega && <span className="form-error">{errors.entrega}</span>}
        </label>

        {customer.entrega === "domicilio" && (
          <label className="wide">
            Direccion
            <input value={customer.direccion} onChange={(event) => update("direccion", event.target.value)} />
            {errors.direccion && <span className="form-error">{errors.direccion}</span>}
          </label>
        )}

        <label>
          Hora solicitada
          <input value={customer.hora} placeholder="2:00 p. m." onChange={(event) => update("hora", event.target.value)} />
          <small className="field-help">Escribe la hora a la que deseas recibir o recoger tu comida.</small>
          {errors.hora && <span className="form-error">{errors.hora}</span>}
        </label>

        <div className="payment-fixed" aria-label="Metodo de pago">
          <span>Metodo de pago</span>
          <strong>Transferencia</strong>
          <small>Te compartiremos los datos para transferir al confirmar el pedido.</small>
        </div>

        <label className="wide">
          Notas adicionales
          <textarea
            rows="3"
            value={customer.notas}
            placeholder="Ej. Tortillas aparte, sin chiles..."
            onChange={(event) => update("notas", event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
