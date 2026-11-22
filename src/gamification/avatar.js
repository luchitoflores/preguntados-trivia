export function seleccionarTraje(user, trajeId) {
  return { ...user, avatar: { ...(user.avatar || {}), trajeActual: trajeId } };
}
