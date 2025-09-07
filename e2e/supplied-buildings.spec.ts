import { expect, test } from "@playwright/test"

test.describe("Supplied Buildings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/buildings")
    // Wait for the page to fully load
    await page.waitForLoadState("domcontentloaded")
  })

  test("displays the main page elements", async ({ page }) => {
    // Check main title is present
    await expect(page.getByRole("heading", { name: "Supplied Buildings" })).toBeVisible()

    // Check add button is present
    await expect(page.getByRole("button", { name: /Add Building/i })).toBeVisible()

    // Check stats card is present
    await expect(page.getByText("Total Buildings")).toBeVisible()

    // Check search input is present
    await expect(page.getByPlaceholder(/Search buildings/i)).toBeVisible()
  })

  test("shows empty state when no buildings exist", async ({ page }) => {
    // Should show empty state message
    await expect(page.getByText("No buildings yet")).toBeVisible()
    await expect(page.getByText("Start by adding your first building.")).toBeVisible()

    // Should show add first building button
    await expect(page.getByRole("button", { name: "Add Your First Building" })).toBeVisible()
  })

  test("can create a new building", async ({ page }) => {
    // Click add button
    await page.getByRole("button", { name: /Add Building/i }).first().click()

    // Modal should open
    await expect(page.getByRole("heading", { name: "Add Building" })).toBeVisible()

    // Fill out the form
    await page.getByLabel("Building Name", { exact: false }).fill("Main Office")
    await page.getByLabel("Description").fill("Corporate headquarters building")

    // Submit the form
    await page.getByRole("button", { name: "Create Building" }).click()

    // Modal should close and building should appear in the list
    await expect(page.getByRole("heading", { name: "Add Building" })).toBeHidden()
    await expect(page.getByText("Main Office")).toBeVisible()
    await expect(page.getByText("Corporate headquarters building")).toBeVisible()

    // Stats should update
    await expect(page.getByText("1").first()).toBeVisible() // total buildings count
  })

  test("can edit an existing building", async ({ page }) => {
    // First create a building
    await page.getByRole("button", { name: /Add Building/i }).first().click()
    await page.getByLabel("Building Name", { exact: false }).fill("Original Building")
    await page.getByLabel("Description").fill("Original description")
    await page.getByRole("button", { name: "Create Building" }).click()

    // Wait for building to appear
    await expect(page.getByText("Original Building")).toBeVisible()

    // Click edit button (pencil icon)
    await page.getByRole("button", { name: "Edit building" }).click()

    // Modal should open with existing data
    await expect(page.getByRole("heading", { name: "Edit Building" })).toBeVisible()
    await expect(page.getByLabel("Building Name", { exact: false })).toHaveValue("Original Building")

    // Edit the building
    await page.getByLabel("Building Name", { exact: false }).fill("Updated Building")
    await page.getByLabel("Description").fill("Updated description")

    // Submit
    await page.getByRole("button", { name: "Update Building" }).click()

    // Verify changes
    await expect(page.getByText("Updated Building")).toBeVisible()
    await expect(page.getByText("Original Building")).toBeHidden()
    await expect(page.getByText("Updated description")).toBeVisible()
  })

  test("can delete a building", async ({ page }) => {
    // First create a building
    await page.getByRole("button", { name: /Add Building/i }).first().click()
    await page.getByLabel("Building Name", { exact: false }).fill("Building to Delete")
    await page.getByLabel("Description").fill("This will be deleted")
    await page.getByRole("button", { name: "Create Building" }).click()

    // Wait for building to appear
    await expect(page.getByText("Building to Delete")).toBeVisible()

    // Click delete button
    await page.getByRole("button", { name: "Delete building" }).click()

    // Confirmation modal should appear
    await expect(page.getByText("Delete Supply Item")).toBeVisible()
    await expect(page.getByText(/Are you sure.*Building to Delete/)).toBeVisible()

    // Confirm deletion
    await page.getByRole("button", { name: "Delete", exact: true }).click()

    // Building should be removed
    await expect(page.getByText("Building to Delete")).toBeHidden()

    // Should return to empty state
    await expect(page.getByText("No buildings yet")).toBeVisible()
  })

  test("can search for buildings", async ({ page }) => {
    // Create multiple buildings
    const buildings = [
      { name: "Office Building A", description: "First office" },
      { name: "Warehouse B", description: "Storage facility" },
      { name: "Office Building C", description: "Second office" },
    ]

    for (const building of buildings) {
      await page.getByRole("button", { name: /Add Building/i }).first().click()
      await page.getByLabel("Building Name", { exact: false }).fill(building.name)
      await page.getByLabel("Description").fill(building.description)
      await page.getByRole("button", { name: "Create Building" }).click()
      await expect(page.getByText(building.name)).toBeVisible()
    }

    // Search for "Office"
    await page.getByPlaceholder(/Search buildings/i).fill("Office")

    // Should show both office buildings
    await expect(page.getByText("Office Building A")).toBeVisible()
    await expect(page.getByText("Office Building C")).toBeVisible()
    await expect(page.getByText("Warehouse B")).toBeHidden()

    // Clear search
    await page.getByPlaceholder(/Search buildings/i).fill("")

    // All buildings should be visible again
    await expect(page.getByText("Office Building A")).toBeVisible()
    await expect(page.getByText("Warehouse B")).toBeVisible()
    await expect(page.getByText("Office Building C")).toBeVisible()
  })

  test("shows no buildings found state when search returns empty", async ({ page }) => {
    // Create a building
    await page.getByRole("button", { name: /Add Building/i }).first().click()
    await page.getByLabel("Building Name", { exact: false }).fill("Test Building")
    await page.getByRole("button", { name: "Create Building" }).click()

    // Search for something that doesn't exist
    await page.getByPlaceholder(/Search buildings/i).fill("NonExistentBuilding")

    // Should show no buildings found state
    await expect(page.getByText("No buildings found")).toBeVisible()
    await expect(page.getByText("Try adjusting your search.")).toBeVisible()

    // Should not show the "add first building" button in this state
    await expect(page.getByRole("button", { name: "Add Your First Building" })).toBeHidden()
  })

  test("can navigate to manage supplies for a building", async ({ page }) => {
    // Create a building
    await page.getByRole("button", { name: /Add Building/i }).first().click()
    await page.getByLabel("Building Name", { exact: false }).fill("Office with Supplies")
    await page.getByRole("button", { name: "Create Building" }).click()

    // Wait for building to appear
    await expect(page.getByText("Office with Supplies")).toBeVisible()

    // Click Manage Supplies button
    await page.getByRole("button", { name: "Manage Supplies" }).click()

    // Should navigate to supply configuration page
    await expect(page).toHaveURL(/\/app\/supply-configuration/)
    await expect(page.getByRole("heading", { name: "Supply Configuration" })).toBeVisible()
  })

  test("displays supply count for buildings", async ({ page }) => {
    // Create a building
    await page.getByRole("button", { name: /Add Building/i }).first().click()
    await page.getByLabel("Building Name", { exact: false }).fill("Building with Count")
    await page.getByRole("button", { name: "Create Building" }).click()

    // Should show 0 supplies initially
    await expect(page.getByText("Supplies:")).toBeVisible()
    await expect(page.locator("text=Supplies:").locator("..").getByText("0")).toBeVisible()
  })

  test("modal can be closed without saving", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Add Building/i }).first().click()
    await expect(page.getByRole("heading", { name: "Add Building" })).toBeVisible()

    // Fill some data
    await page.getByLabel("Building Name", { exact: false }).fill("Unsaved Building")

    // Close with Cancel button
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByRole("heading", { name: "Add Building" })).toBeHidden()

    // Building should not have been created
    await expect(page.getByText("Unsaved Building")).toBeHidden()
  })

  test("handles form validation", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Add Building/i }).first().click()

    // Try to submit without filling required field
    await page.getByLabel("Building Name", { exact: false }).fill("")
    await page.getByRole("button", { name: "Create Building" }).click()

    // Modal should remain open
    await expect(page.getByRole("heading", { name: "Add Building" })).toBeVisible()

    // Fill name with only spaces
    await page.getByLabel("Building Name", { exact: false }).fill("   ")
    await page.getByRole("button", { name: "Create Building" }).click()

    // Should show alert or validation (modal stays open)
    await expect(page.getByRole("heading", { name: "Add Building" })).toBeVisible()
  })
})