// src/app/invoice/utils/formatters.ts
export const formatPrice = (value: number | string) => {
  if (!value) return "";
  const num = value.toString().replace(/,/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const parsePrice = (value: string) => {
  return parseInt(value.replace(/,/g, "")) || 0;
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("fa-IR").format(num);
};
