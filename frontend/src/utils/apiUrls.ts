export const baseURL = import.meta.env.VITE_API_BASE_URL

export const apiUrls = {
  reserves: `${baseURL}/reserves`,
  reserveCategories: `${baseURL}/reserve_categories`,
  reserveCategory: `${baseURL}/reserve_category`,
  reserve: `${baseURL}/reserve`,
}