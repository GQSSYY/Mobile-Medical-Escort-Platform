import { createPinia } from 'pinia'
import { useMenuStore } from './menu'

const pinia = createPinia()
pinia.use(({ store }) => {
  if (store.$id === 'menu') store.$subscribe((_mutation, state) => localStorage.setItem('v3pz', JSON.stringify({ menu: state })))
})
export { useMenuStore }
export default pinia
