import { expect, test } from "@playwright/test"

test.describe("Shopping List Page", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the main page and navigate to shopping list
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")
    
    // Navigate to shopping list
    await page.getByRole("link", { name: "Shopping List" }).click()
    await page.waitForLoadState("domcontentloaded")
  })

  test("displays the main shopping list elements", async ({ page }) => {
    // Check main title is present
    await expect(page.getByRole("heading", { name: "Shopping List" })).toBeVisible()

    // Check back button is present
    await expect(page.getByTitle("Back to Buildings")).toBeVisible()

    // Check add button is present
    await expect(page.getByRole("button", { name: /Add.*Item/i })).toBeVisible()

    // Check filters are present
    await expect(page.getByPlaceholder(/Search shopping list/i)).toBeVisible()
    await expect(page.getByRole("combobox").filter({ hasText: /All Categories/i })).toBeVisible()
    await expect(page.getByRole("combobox").filter({ hasText: /All Buildings/i })).toBeVisible()

    // Check show bought items toggle
    await expect(page.getByLabel("Show bought items")).toBeVisible()

    // Check stats cards are present
    await expect(page.getByText("Total Items")).toBeVisible()
    await expect(page.getByText("To Buy")).toBeVisible()
    await expect(page.getByText("Bought")).toBeVisible()
  })

  test("shows empty state when no items exist", async ({ page }) => {
    // Should show empty state message
    await expect(page.getByText("Your shopping list is empty")).toBeVisible()
    await expect(page.getByText("Add items to start your shopping list")).toBeVisible()

    // Should show add first item button
    await expect(page.getByRole("button", { name: "Add First Item" })).toBeVisible()
  })

  test("can create a new shopping item", async ({ page }) => {
    // Click add button
    await page.getByRole("button", { name: /Add.*item/i }).first().click()

    // Modal should open
    await expect(page.getByRole("heading", { name: "Add Shopping Item" })).toBeVisible()

    // Fill out the form
    await page.getByLabel("Name").fill("Milk")
    await page.getByLabel("Quantity to Buy").fill("2")
    await page.getByLabel("Shopping Hint").fill("Buy organic if available")
    await page.getByLabel("Notes").fill("For breakfast cereal")
    await page.getByLabel("Category").fill("Dairy")

    // Submit the form
    await page.getByRole("button", { name: "Add to List" }).click()

    // Modal should close and item should appear
    await expect(page.getByRole("heading", { name: "Add Shopping Item" })).toBeHidden()
    await expect(page.getByText("Milk")).toBeVisible()
    await expect(page.getByText("Buy organic if available")).toBeVisible()
    await expect(page.getByText("For breakfast cereal")).toBeVisible()

    // Stats should update
    await expect(page.getByText("1").first()).toBeVisible() // total items count
  })

  test("can edit an existing shopping item", async ({ page }) => {
    // First create an item
    await page.getByRole("button", { name: /Add.*item/i }).first().click()
    await page.getByLabel("Name").fill("Original Item")
    await page.getByLabel("Quantity to Buy").fill("1")
    await page.getByRole("button", { name: "Add to List" }).click()

    // Wait for item to appear
    await expect(page.getByText("Original Item")).toBeVisible()

    // Click edit button (pencil icon)
    await page.getByRole("button", { name: "Edit item" }).click()

    // Modal should open with existing data
    await expect(page.getByRole("heading", { name: "Edit Shopping Item" })).toBeVisible()
    await expect(page.getByLabel("Name")).toHaveValue("Original Item")

    // Edit the item
    await page.getByLabel("Name").fill("Updated Item")
    await page.getByLabel("Quantity to Buy").fill("3")

    // Submit
    await page.getByRole("button", { name: "Update Item" }).click()

    // Verify changes
    await expect(page.getByText("Updated Item")).toBeVisible()
    await expect(page.getByText("Original Item")).toBeHidden()
    await expect(page.getByText("3")).toBeVisible()
  })

  test("can delete a shopping item", async ({ page }) => {
    // First create an item
    await page.getByRole("button", { name: /Add.*item/i }).first().click()
    await page.getByLabel("Name").fill("Item to Delete")
    await page.getByLabel("Quantity to Buy").fill("1")
    await page.getByRole("button", { name: "Add to List" }).click()

    // Wait for item to appear
    await expect(page.getByText("Item to Delete")).toBeVisible()

    // Click delete button
    await page.getByRole("button", { name: "Delete item" }).click()

    // Confirmation modal should appear
    await expect(page.getByText("Delete Shopping Item")).toBeVisible()
    await expect(page.getByText(/Are you sure.*Item to Delete/)).toBeVisible()

    // Confirm deletion
    await page.getByRole("button", { name: "Delete", exact: true }).click()

    // Item should be removed
    await expect(page.getByText("Item to Delete")).toBeHidden()

    // Should return to empty state
    await expect(page.getByText("Your shopping list is empty")).toBeVisible()
  })

  test("can toggle items as bought/unbought", async ({ page }) => {
    // Create an item
    await page.getByRole("button", { name: /Add.*item/i }).first().click()
    await page.getByLabel("Name").fill("Test Item")
    await page.getByLabel("Quantity to Buy").fill("1")
    await page.getByRole("button", { name: "Add to List" }).click()

    // Wait for item to appear
    await expect(page.getByText("Test Item")).toBeVisible()

    // Check the item checkbox to mark as bought
    const checkbox = page.getByRole("checkbox").first()
    await checkbox.check()

    // Item should have strike-through styling (opacity reduced)
    const itemCard = page.locator('[class*="opacity-60"]')
    await expect(itemCard).toBeVisible()

    // Stats should update - "Bought" should show 1
    await expect(page.getByText("Bought").locator("..").getByText("1")).toBeVisible()
    await expect(page.getByText("To Buy").locator("..").getByText("0")).toBeVisible()

    // Uncheck to mark as not bought
    await checkbox.uncheck()

    // Item should not have strike-through styling
    await expect(itemCard).toBeHidden()

    // Stats should update back
    await expect(page.getByText("To Buy").locator("..").getByText("1")).toBeVisible()
    await expect(page.getByText("Bought").locator("..").getByText("0")).toBeVisible()
  })

  test("can search for items", async ({ page }) => {
    // Create multiple items
    const items = [
      { name: "Organic Milk", quantity: "1" },
      { name: "Bread", quantity: "2" },
      { name: "Almond Milk", quantity: "1" },
    ]

    for (const item of items) {
      await page.getByRole("button", { name: /Add.*item/i }).first().click()
      await page.getByLabel("Name").fill(item.name)
      await page.getByLabel("Quantity to Buy").fill(item.quantity)
      await page.getByRole("button", { name: "Add to List" }).click()
      await expect(page.getByText(item.name)).toBeVisible()
    }

    // Search for "Milk"
    await page.getByPlaceholder(/Search shopping list/i).fill("Milk")

    // Should show both milk items
    await expect(page.getByText("Organic Milk")).toBeVisible()
    await expect(page.getByText("Almond Milk")).toBeVisible()
    await expect(page.getByText("Bread")).toBeHidden()

    // Clear search
    await page.getByPlaceholder(/Search shopping list/i).fill("")

    // All items should be visible again
    await expect(page.getByText("Organic Milk")).toBeVisible()
    await expect(page.getByText("Bread")).toBeVisible()
    await expect(page.getByText("Almond Milk")).toBeVisible()
  })

  test("can filter by category", async ({ page }) => {
    // Create items with different categories
    const items = [
      { name: "Milk", category: "Dairy" },
      { name: "Bread", category: "Bakery" },
      { name: "Cheese", category: "Dairy" },
    ]

    for (const item of items) {
      await page.getByRole("button", { name: /Add.*item/i }).first().click()
      await page.getByLabel("Name").fill(item.name)
      await page.getByLabel("Quantity to Buy").fill("1")
      await page.getByLabel("Category").fill(item.category)
      await page.getByRole("button", { name: "Add to List" }).click()
      await expect(page.getByText(item.name)).toBeVisible()
    }

    // Filter by Dairy
    const categorySelect = page.getByRole("combobox").filter({ hasText: /All Categories/i })
    await categorySelect.click()
    await page.getByRole("option", { name: "Dairy" }).click()

    // Should show only dairy items
    await expect(page.getByText("Milk")).toBeVisible()
    await expect(page.getByText("Cheese")).toBeVisible()
    await expect(page.getByText("Bread")).toBeHidden()

    // Reset filter
    await categorySelect.click()
    await page.getByRole("option", { name: "All Categories" }).click()

    // All items should be visible again
    await expect(page.getByText("Milk")).toBeVisible()
    await expect(page.getByText("Bread")).toBeVisible()
    await expect(page.getByText("Cheese")).toBeVisible()
  })

  test("can filter by building", async ({ page }) => {
    // First, we need to create a building and items associated with it
    // Navigate back to buildings page
    await page.getByTitle("Back to Buildings").click()
    
    // Create a building
    await page.getByRole("button", { name: /Add.*Building/i }).first().click()
    await page.getByLabel(/Building Name/i).fill("Test Office")
    await page.getByRole("button", { name: /Create Building/i }).click()
    
    // Click on the building to go to supply configuration
    await page.getByText("Test Office").click()
    
    // Create a supply item
    await page.getByRole("button", { name: /Add.*item/i }).first().click()
    await page.getByLabel("Name", { exact: false }).fill("Office Supplies")
    await page.getByLabel("Quantity").fill("5")
    await page.getByRole("button", { name: "Create Item" }).click()
    
    // Add to shopping list
    await page.getByRole("button", { name: "Add to shopping list" }).click()
    await page.getByRole("button", { name: "Add to List" }).click()
    
    // Navigate to shopping list
    await page.getByRole("link", { name: "Shopping List" }).click()
    
    // Create an item without building association
    await page.getByRole("button", { name: /Add.*item/i }).first().click()
    await page.getByLabel("Name").fill("Personal Item")
    await page.getByLabel("Quantity to Buy").fill("1")
    await page.getByRole("button", { name: "Add to List" }).click()

    // Both items should be visible initially
    await expect(page.getByText("Office Supplies")).toBeVisible()
    await expect(page.getByText("Personal Item")).toBeVisible()

    // Filter by building
    const buildingSelect = page.getByRole("combobox").filter({ hasText: /All Buildings/i })
    await buildingSelect.click()
    await page.getByRole("option", { name: "Test Office" }).click()

    // Should show only office item
    await expect(page.getByText("Office Supplies")).toBeVisible()
    await expect(page.getByText("Personal Item")).toBeHidden()

    // Reset filter
    await buildingSelect.click()
    await page.getByRole("option", { name: "All Buildings" }).click()

    // Both items should be visible again
    await expect(page.getByText("Office Supplies")).toBeVisible()
    await expect(page.getByText("Personal Item")).toBeVisible()
  })

  test("can toggle show/hide bought items", async ({ page }) => {
    // Create and mark some items as bought
    const items = ["Milk", "Bread", "Eggs"]
    
    for (const item of items) {
      await page.getByRole("button", { name: /Add.*item/i }).first().click()
      await page.getByLabel("Name").fill(item)
      await page.getByLabel("Quantity to Buy").fill("1")
      await page.getByRole("button", { name: "Add to List" }).click()
      await expect(page.getByText(item)).toBeVisible()
    }

    // Mark first two items as bought
    const checkboxes = page.getByRole("checkbox")
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()

    // All items should still be visible
    await expect(page.getByText("Milk")).toBeVisible()
    await expect(page.getByText("Bread")).toBeVisible()
    await expect(page.getByText("Eggs")).toBeVisible()

    // Toggle off "Show bought items"
    await page.getByLabel("Show bought items").uncheck()

    // Only unbought item should be visible
    await expect(page.getByText("Eggs")).toBeVisible()
    await expect(page.getByText("Milk")).toBeHidden()
    await expect(page.getByText("Bread")).toBeHidden()

    // Toggle back on
    await page.getByLabel("Show bought items").check()

    // All items should be visible again
    await expect(page.getByText("Milk")).toBeVisible()
    await expect(page.getByText("Bread")).toBeVisible()
    await expect(page.getByText("Eggs")).toBeVisible()
  })

  test("can clear bought items", async ({ page }) => {
    // Create items and mark some as bought
    const items = ["Item 1", "Item 2", "Item 3"]
    
    for (const item of items) {
      await page.getByRole("button", { name: /Add.*item/i }).first().click()
      await page.getByLabel("Name").fill(item)
      await page.getByLabel("Quantity to Buy").fill("1")
      await page.getByRole("button", { name: "Add to List" }).click()
      await expect(page.getByText(item)).toBeVisible()
    }

    // Mark first two as bought
    const checkboxes = page.getByRole("checkbox")
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()

    // Clear bought button should appear
    await expect(page.getByRole("button", { name: /Clear Bought.*\(2\)/i })).toBeVisible()

    // Use page.on to handle the confirmation dialog
    page.on("dialog", dialog => dialog.accept())
    
    // Click clear bought
    await page.getByRole("button", { name: /Clear Bought.*\(2\)/i }).click()

    // Only unbought item should remain
    await expect(page.getByText("Item 3")).toBeVisible()
    await expect(page.getByText("Item 1")).toBeHidden()
    await expect(page.getByText("Item 2")).toBeHidden()

    // Clear bought button should be hidden
    await expect(page.getByRole("button", { name: /Clear Bought/i })).toBeHidden()
  })

  test("shows no items found state when filters return empty", async ({ page }) => {
    // Create an item
    await page.getByRole("button", { name: /Add.*item/i }).first().click()
    await page.getByLabel("Name").fill("Test Item")
    await page.getByLabel("Quantity to Buy").fill("1")
    await page.getByLabel("Category").fill("Test Category")
    await page.getByRole("button", { name: "Add to List" }).click()

    // Search for something that doesn't exist
    await page.getByPlaceholder(/Search shopping list/i).fill("NonExistentItem")

    // Should show no items found state
    await expect(page.getByText("No items found")).toBeVisible()
    await expect(page.getByText("Try adjusting your filters")).toBeVisible()

    // Should not show the "add first item" button in this state
    await expect(page.getByRole("button", { name: "Add First Item" })).toBeHidden()
  })

  test("handles form validation", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Add.*item/i }).first().click()

    // Try to submit without name
    await page.getByLabel("Quantity to Buy").fill("5")
    await page.getByRole("button", { name: "Add to List" }).click()

    // Should show validation error inline
    await expect(page.getByText("Name is required")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Add Shopping Item" })).toBeVisible()

    // Try with invalid quantity
    await page.getByLabel("Name").fill("Valid Name")
    await page.getByLabel("Quantity to Buy").fill("0")
    await page.getByRole("button", { name: "Add to List" }).click()

    // Should show validation error
    await expect(page.getByText("Quantity must be at least 1")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Add Shopping Item" })).toBeVisible()
  })

  test("can navigate back to buildings", async ({ page }) => {
    // Click back button
    await page.getByTitle("Back to Buildings").click()

    // Should navigate to buildings page
    await expect(page.getByRole("heading", { name: "Supplied Buildings" })).toBeVisible()
  })

  test("modal can be closed without saving", async ({ page }) => {
    // Open modal
    await page.getByRole("button", { name: /Add.*item/i }).first().click()
    await expect(page.getByRole("heading", { name: "Add Shopping Item" })).toBeVisible()

    // Fill some data
    await page.getByLabel("Name").fill("Unsaved Item")

    // Close with Cancel button
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByRole("heading", { name: "Add Shopping Item" })).toBeHidden()

    // Item should not have been created
    await expect(page.getByText("Unsaved Item")).toBeHidden()
  })

  test("displays item details correctly in cards", async ({ page }) => {
    // Create a comprehensive item
    await page.getByRole("button", { name: /Add.*item/i }).first().click()
    await page.getByLabel("Name").fill("Premium Coffee")
    await page.getByLabel("Quantity to Buy").fill("3")
    await page.getByLabel("Shopping Hint").fill("Get the dark roast")
    await page.getByLabel("Notes").fill("For the office machine")
    await page.getByLabel("Category").fill("Beverages")
    await page.getByRole("button", { name: "Add to List" }).click()

    // Verify all details are displayed in the card
    await expect(page.getByText("Premium Coffee")).toBeVisible()
    await expect(page.getByText("Get the dark roast")).toBeVisible()
    await expect(page.getByText("For the office machine")).toBeVisible()
    await expect(page.getByText("Beverages")).toBeVisible()
    await expect(page.getByText("3")).toBeVisible()
  })
})