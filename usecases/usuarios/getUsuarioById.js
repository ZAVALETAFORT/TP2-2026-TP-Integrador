// Caso de uso: consultar usuario por ID.
async function getUsuarioById(id, dao) {
  return dao.getById(id);
}

export default getUsuarioById;