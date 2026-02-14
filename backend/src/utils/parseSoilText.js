module.exports = (text) => {
  const get = (k) =>
    Number(text.match(new RegExp(`${k}[^0-9]*([0-9.]+)`, "i"))?.[1]);

  return { N: get("Nitrogen"), P: get("Phosphorus"), K: get("Potassium"), pH: get("pH") };
};
