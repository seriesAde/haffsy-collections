import { api } from '../../../services/api'
export async function listCategories({signal}) { return (await api('/categories',{signal})).data }
