// Caso de uso: listar usuarios.
async function getUsuarios(dao) {
  return dao.getAll();
}

export default getUsuarios;