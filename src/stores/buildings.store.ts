import type { SqlValue } from "@sqlite.org/sqlite-wasm"
import { defineStore } from "pinia"
import { initDB } from "~/database/sqlite"
import type { Building } from "~/types/building"

interface BuildingsState {
  buildings: Building[]
  selectedBuildingId: string | null
  isLoading: boolean
}

interface BuildingRow {
  id: string
  name: string
}

export const useBuildingsStore = defineStore("buildings", {
  state: (): BuildingsState => ({
    buildings: [],
    selectedBuildingId: null,
    isLoading: false,
  }),
  actions: {
    async fetchBuildings(): Promise<void> {
      this.isLoading = true
      try {
        const db = await initDB()
        const rows: BuildingRow[] = []

        // .exec provides a callback for each row returned
        db.exec(
          "SELECT id, name FROM buildings",

          {
            callback(result: SqlValue) {
              console.debug("Row result:", result, typeof result)
              if (!result) {
                return
              }

              const row = result as unknown as string[]

              rows.push({
                id: row[0] as string,
                name: row[1] as string,
              })
            },
            rowMode: "array",
          },
        )
        console.debug("Fetched buildings:", rows)
        // this.buildings = rows
      } finally {
        this.isLoading = false
      }
    },
    async addBuilding(name: string): Promise<void> {
      const db = await initDB()
      const id = crypto.randomUUID()
      db.exec({
        sql: "INSERT INTO buildings (id, name) VALUES (?, ?)",
        bind: [id, name],
      })

      // Refresh the local state from the source of truth (DB)
      await this.fetchBuildings()
    },

    async toggleTodo(id: number, currentStatus: number): Promise<void> {
      const db = await initDB()
      const newStatus = currentStatus === 0 ? 1 : 0

      db.exec({
        sql: "UPDATE todos SET completed = ? WHERE id = ?",
        bind: [newStatus, id],
      })

      await this.fetchBuildings()
    },
  },
})
