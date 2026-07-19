const formatHour = (hour) => {
  const suffix = hour >= 12 ? "p. m." : "a. m.";
  const normalized = hour % 12 || 12;
  return `${normalized}:00 ${suffix}`;
};

export const getOrderingStatus = (config, date = new Date()) => {
  const startHour = config.horaInicioPedidos ?? 7;
  const endHour = config.horaFinPedidos ?? 12;
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  const isOpen = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  const rangeLabel = `${formatHour(startHour)} a ${formatHour(endHour)}`;

  return {
    isOpen,
    rangeLabel,
    currentLabel: new Intl.DateTimeFormat("es-MX", {
      hour: "numeric",
      minute: "2-digit"
    }).format(date),
    message: isOpen
      ? `Puedes enviar tu pedido ahora. El horario para ordenar es de ${rangeLabel}.`
      : `En este momento no se pueden enviar pedidos. El horario para ordenar es de ${rangeLabel}; tu carrito queda guardado en canasta para retomarlo despues.`
  };
};
