import type { Area } from "./area"
import type { ShoppingItem } from "./shopping-item"
import type { StockItem } from "./stock-item"
import type { User } from "./user"

export interface Building {
  id: string
  name: string
  users: User[]
  shoppingList: ShoppingItem[]
  stock: StockItem[]
  areas: Area[]
}
