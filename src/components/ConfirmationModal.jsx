export default function ConfirmationModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">Deseas solicitar este pedido?</h2>
        <p>
          Se abrira WhatsApp con el resumen completo de tu seleccion. El pedido quedara pendiente de
          confirmacion.
        </p>
        <div className="button-row end">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="primary" onClick={onConfirm}>
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
