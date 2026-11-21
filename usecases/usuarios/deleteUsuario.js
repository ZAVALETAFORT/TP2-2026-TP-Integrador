// Caso de uso: eliminar usuario.
async function deleteUsuario(id, dao) {
  return dao.delete(id);
}

export default deleteUsuario;