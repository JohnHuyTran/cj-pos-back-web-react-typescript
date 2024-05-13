export const getById = (id: string) => {
  return document.querySelector(`#${id}`);
};
export const getByClass = (className: string) => {
  return document.querySelector(`.${className}`);
};
