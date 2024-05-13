export const getPathUrl = (
  pathUrl: string,
  urlParams: { [key: string]: string },
) => {
  for (const urlParamsKey in urlParams) {
    if (urlParams[urlParamsKey]) {
      pathUrl = pathUrl.replace(
        new RegExp(`{${urlParamsKey}}`, "g"),
        urlParams[urlParamsKey],
      );
    }
  }
  return pathUrl;
};
