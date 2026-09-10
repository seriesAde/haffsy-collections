import { createContext, useContext } from 'react'
export const InventoryContext=createContext(null)
export function useInventory(){return useContext(InventoryContext)}
