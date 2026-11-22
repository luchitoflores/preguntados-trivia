/** Adaptadores de almacenamiento sin dependencia de servicios externos. */
export function crearAdaptadorLocal(storage = globalThis.localStorage) {
  return {
    getItem: clave => storage?.getItem(clave) ?? null,
    setItem: (clave, valor) => storage?.setItem(clave, valor),
    removeItem: clave => storage?.removeItem(clave),
  };
}

export function crearAdaptadorMemoria(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: clave => values.get(clave) ?? null,
    setItem: (clave, valor) => values.set(clave, String(valor)),
    removeItem: clave => values.delete(clave),
    clear: () => values.clear(),
  };
}
