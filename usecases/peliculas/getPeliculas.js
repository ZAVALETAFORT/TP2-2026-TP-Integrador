//Caso de uso: Retorno todas las pelis, le paso el "dao" que quiero usar (Memory, sql, etc)
async function getPeliculas(dao) {
  return dao.getAll();
}
export default getPeliculas;

