export const adminConfig = {
  toast: {
    created: "Creado correctamente.",
    updated: "Guardado correctamente.",
    saved: "Guardado correctamente.",
  },
  printLists: {
    navLabel: "Impresiones",
    href: "/admin/impresiones",
    eyebrow: "Landing",
    title: "Impresiones",
    description:
      "Edita el nombre y el valor de cada tamaño. Las fotos y los títulos de la landing no cambian.",
    nameLabel: "Nombre",
    valueLabel: "Valor",
    addLabel: "Agregar fila",
    removeLabel: "Quitar",
    saveLabel: "Guardar cambios",
    namePlaceholder: "10×15",
    valuePlaceholder: "20.000",
  },
  conditions: {
    navLabel: "Condiciones",
    href: "/admin/condiciones",
    eyebrow: "Landing",
    title: "Condiciones",
    description:
      "Edita el título y el texto de cada condición. El encabezado de la sección no cambia.",
    titleLabel: "Título",
    bodyLabel: "Texto",
    addLabel: "Agregar condición",
    removeLabel: "Quitar",
    saveLabel: "Guardar cambios",
    titlePlaceholder: "Galería",
    bodyPlaceholder: "Describe la condición…",
  },
} as const;
