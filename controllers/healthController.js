function getHealth(req, res) { //Controller: Solo responde el req HTTP de health 
  res.status(200).json({ status: "funca OK de controller" });
}

export { getHealth }; //exporto para usar desde afuera (Routes)