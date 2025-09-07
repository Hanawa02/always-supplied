import { expect, test } from "@playwright/test"

test.describe("Supply Configuration Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    // Wait for the page to fully load
    await page.waitForLoadState("domcontentloaded")
  })

  test("displays the main page elements", async ({ page }) => {
    // Check main title is present using role
    await expect(page.getByRole("heading", { name: "Supply Configuration" })).toBeVisible()

    // Check add button is present
    await expect(page.getByRole("button", { name: /Add Supply Item|Add Item/i })).toBeVisible()

    // Check stats card is present
    await expect(page.getByText("Total Items")).toBeVisible()

    // Check search input is present
    await expect(page.getByPlaceholder(/Search/i)).toBeVisible()

    // Check category filter is present
    await expect(page.getByRole("combobox").filter({ hasText: /All Categories/i })).toBeVisible()
  })

  test("shows empty state when no items exist", async ({ page }) => {
    // Should show empty state message
    await expect(page.getByText("No supply items yet")).toBeVisible()
    await expect(page.getByText("Start by adding your first supply item.")).toBeVisible()

    // Should show add first item button
    await expect(page.getByRole("button", { name: "Add Your First Item" })).toBeVisible()
  })

  test("can create a new supply item", async ({ page }) => {
    // Click add button
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()

    // Modal should open
    await expect(page.getByRole("heading", { name: "Add Supply Item" })).toBeVisible()

    // Fill out the form using labels and roles
    await page.getByLabel("Name", { exact: false }).fill("Test Paper Towels")
    await page.getByLabel("Description").fill("High quality paper towels for kitchen use")
    await page.getByLabel("Quantity").fill("12")

    // Select category
    await page.getByLabel("Category").selectOption("Cleaning Supplies")

    // Select storage room
    await page.getByLabel("Storage Room").selectOption("Kitchen")

    // Add shopping hint
    await page.getByLabel("Shopping Hint").fill("Buy when on sale")

    // Add preferred brand
    await page.getByPlaceholder("Add a brand...").fill("Bounty")
    // Click the add brand button (plus icon button next to the input)
    await page.getByPlaceholder("Add a brand...").locator("..").getByRole("button").click()

    // Verify brand was added
    await expect(page.getByText("Bounty")).toBeVisible()

    // Submit the form
    await page.getByRole("button", { name: "Create Item" }).click()

    // Modal should close and item should appear in the list
    await expect(page.getByRole("heading", { name: "Add Supply Item" })).toBeHidden()
    await expect(page.getByText("Test Paper Towels")).toBeVisible()

    // Quantity should be visible
    await expect(page.getByText("12")).toBeVisible()

    // Stats should update
    await expect(page.getByText("1").first()).toBeVisible() // total items count
  })

  test("can edit an existing supply item", async ({ page }) => {
    // First create an item
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()
    await page.getByLabel("Name", { exact: false }).fill("Original Item")
    await page.getByLabel("Quantity").fill("5")
    await page.getByRole("button", { name: "Create Item" }).click()

    // Wait for item to appear
    await expect(page.getByText("Original Item")).toBeVisible()

    // Click edit button (pencil icon)
    await page.getByRole("button", { name: "Edit item" }).click()

    // Modal should open with existing data
    await expect(page.getByRole("heading", { name: "Edit Supply Item" })).toBeVisible()
    await expect(page.getByLabel("Name", { exact: false })).toHaveValue("Original Item")

    // Edit the item
    await page.getByLabel("Name", { exact: false }).fill("Updated Item")
    await page.getByLabel("Quantity").fill("10")

    // Submit
    await page.getByRole("button", { name: "Update Item" }).click()

    // Verify changes
    await expect(page.getByText("Updated Item")).toBeVisible()
    await expect(page.getByText("Original Item")).toBeHidden()
    await expect(page.getByText("10")).toBeVisible()
  })

  test("can delete a supply item", async ({ page }) => {
    // First create an item
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()
    await page.getByLabel("Name", { exact: false }).fill("Item to Delete")
    await page.getByLabel("Quantity").fill("3")
    await page.getByRole("button", { name: "Create Item" }).click()

    // Wait for item to appear
    await expect(page.getByText("Item to Delete")).toBeVisible()

    // Click delete button
    await page.getByRole("button", { name: "Delete item" }).click()

    // Confirmation modal should appear
    await expect(page.getByText("Delete Supply Item")).toBeVisible()
    await expect(page.getByText(/Are you sure.*Item to Delete/)).toBeVisible()

    // Confirm deletion
    await page.getByRole("button", { name: "Delete", exact: true }).click()

    // Item should be removed
    await expect(page.getByText("Item to Delete")).toBeHidden()

    // Should return to empty state
    await expect(page.getByText("No supply items yet")).toBeVisible()
  })

  test("can search for items", async ({ page }) => {
    // Create multiple items
    const items = [
      { name: "Paper Towels", quantity: "5" },
      { name: "Dish Soap", quantity: "2" },
      { name: "Toilet Paper", quantity: "8" },
    ]

    for (const item of items) {
      await page
        .getByRole("button", { name: /Add.*item/i })
        .first()
        .click()
      await page.getByLabel("Name", { exact: false }).fill(item.name)
      await page.getByLabel("Quantity").fill(item.quantity)
      await page.getByRole("button", { name: "Create Item" }).click()
      await expect(page.getByText(item.name)).toBeVisible()
    }

    // Search for "Paper"
    await page.getByPlaceholder(/Search/i).fill("Paper")

    // Should show both paper items
    await expect(page.getByText("Paper Towels")).toBeVisible()
    await expect(page.getByText("Toilet Paper")).toBeVisible()
    await expect(page.getByText("Dish Soap")).toBeHidden()

    // Clear search
    await page.getByPlaceholder(/Search/i).fill("")

    // All items should be visible again
    await expect(page.getByText("Paper Towels")).toBeVisible()
    await expect(page.getByText("Dish Soap")).toBeVisible()
    await expect(page.getByText("Toilet Paper")).toBeVisible()
  })

  test("can filter by category", async ({ page }) => {
    // Create items with different categories
    const items = [
      { name: "Paper Towels", category: "Cleaning Supplies" },
      { name: "Pasta", category: "Food & Beverages" },
      { name: "Dish Soap", category: "Cleaning Supplies" },
    ]

    for (const item of items) {
      await page
        .getByRole("button", { name: /Add.*item/i })
        .first()
        .click()
      await page.getByLabel("Name", { exact: false }).fill(item.name)
      await page.getByLabel("Quantity").fill("1")
      await page.getByLabel("Category").selectOption(item.category)
      await page.getByRole("button", { name: "Create Item" }).click()
      await expect(page.getByText(item.name)).toBeVisible()
    }

    // Filter by Cleaning Supplies
    // Find the select that contains "All Categories" option
    const categorySelect = page
      .locator("select")
      .filter({ has: page.locator('option:text("All Categories")') })
    await categorySelect.selectOption("Cleaning Supplies")

    // Should show only cleaning items
    await expect(page.getByText("Paper Towels")).toBeVisible()
    await expect(page.getByText("Dish Soap")).toBeVisible()
    await expect(page.getByText("Pasta")).toBeHidden()

    // Reset filter
    await categorySelect.selectOption("")

    // All items should be visible again
    await expect(page.getByText("Paper Towels")).toBeVisible()
    await expect(page.getByText("Pasta")).toBeVisible()
    await expect(page.getByText("Dish Soap")).toBeVisible()
  })

  test("shows no items found state when search/filter returns empty", async ({ page }) => {
    // Create an item
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()
    await page.getByLabel("Name", { exact: false }).fill("Test Item")
    await page.getByLabel("Quantity").fill("1")
    await page.getByRole("button", { name: "Create Item" }).click()

    // Search for something that doesn't exist
    await page.getByPlaceholder(/Search/i).fill("NonExistentItem")

    // Should show no items found state
    await expect(page.getByText("No items found")).toBeVisible()
    await expect(page.getByText("Try adjusting your search or filters.")).toBeVisible()

    // Should not show the "add first item" button in this state
    await expect(page.getByRole("button", { name: "Add Your First Item" })).toBeHidden()
  })

  test("handles form validation", async ({ page }) => {
    // Open modal
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()

    // Clear name field and try to submit
    await page.getByLabel("Name", { exact: false }).fill("")
    await page.getByLabel("Quantity").fill("5")

    // Browser validation should prevent submission
    // Try to submit - the form should not close
    await page.getByRole("button", { name: "Create Item" }).click()

    // Modal should remain open
    await expect(page.getByRole("heading", { name: "Add Supply Item" })).toBeVisible()

    // Try with negative quantity
    await page.getByLabel("Name", { exact: false }).fill("Valid Name")
    await page.getByLabel("Quantity").fill("-1")
    await page.getByRole("button", { name: "Create Item" }).click()

    // Should show alert or validation (check if modal is still open)
    // We can check if an alert appears or if the modal stays open
    // Give time for validation to process

    // Modal should still be visible (validation failed)
    await expect(page.getByRole("heading", { name: "Add Supply Item" })).toBeVisible()
  })

  test("can add custom category", async ({ page }) => {
    // Open modal
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()

    // Fill required fields
    await page.getByLabel("Name", { exact: false }).fill("Custom Item")
    await page.getByLabel("Quantity").fill("1")

    // Select custom category option
    await page.getByLabel("Category").selectOption("custom")

    // Custom category input should appear
    await expect(page.getByPlaceholder("Enter custom category...")).toBeVisible()

    // Enter custom category
    await page.getByPlaceholder("Enter custom category...").fill("My Custom Category")
    
    // Click the save button (checkmark icon)
    await page.getByTitle("Save custom category").click()

    // Submit the main form
    await page.getByRole("button", { name: "Create Item" }).click()

    // Verify item was created with custom category
    await expect(page.getByText("Custom Item")).toBeVisible()
    // Check that the category appears in the item display (not the dropdown)
    await expect(page.locator('div').filter({ hasText: /^My Custom Category$/ })).toBeVisible()
  })

  test("can add custom storage room", async ({ page }) => {
    // Open modal
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()

    // Fill required fields
    await page.getByLabel("Name", { exact: false }).fill("Storage Item")
    await page.getByLabel("Quantity").fill("1")

    // Select custom storage room option
    await page.getByLabel("Storage Room").selectOption("custom")

    // Custom storage room input should appear
    await expect(page.getByPlaceholder("Enter custom storage room...")).toBeVisible()

    // Enter custom storage room
    await page.getByPlaceholder("Enter custom storage room...").fill("My Custom Storage")
    
    // Click the save button (checkmark icon)
    await page.getByTitle("Save custom storage room").click()

    // Submit the main form
    await page.getByRole("button", { name: "Create Item" }).click()

    // Verify item was created with custom storage room
    await expect(page.getByText("Storage Item")).toBeVisible()
    // Check that the storage room appears in the item display
    await expect(page.locator('div').filter({ hasText: /^My Custom Storage$/ })).toBeVisible()
  })

  test("can manage preferred brands", async ({ page }) => {
    // Open modal
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()

    // Fill required fields
    await page.getByLabel("Name", { exact: false }).fill("Branded Item")
    await page.getByLabel("Quantity").fill("1")

    // Add multiple brands
    const brands = ["Brand A", "Brand B", "Brand C"]

    for (const brand of brands) {
      await page.getByPlaceholder("Add a brand...").fill(brand)
      // Click the add button next to the brand input
      await page.getByPlaceholder("Add a brand...").locator("..").getByRole("button").click()
      await expect(page.getByText(brand, { exact: true })).toBeVisible()
    }

    // Remove middle brand - simpler approach: just verify we can remove one
    // Click the remove button of the second brand (Brand B)
    const brandButtons = page.locator('span:has-text("Brand B") + button')
    await brandButtons.click()
    await expect(page.getByText("Brand B", { exact: true })).toBeHidden()

    // Verify other brands still exist
    await expect(page.getByText("Brand A", { exact: true })).toBeVisible()
    await expect(page.getByText("Brand C", { exact: true })).toBeVisible()

    // Submit form
    await page.getByRole("button", { name: "Create Item" }).click()

    // Verify brands appear in the item display
    await expect(page.getByText("Brand A")).toBeVisible()
    await expect(page.getByText("Brand C")).toBeVisible()
    await expect(page.getByText("Brand B")).toBeHidden()
  })

  test("displays item details correctly", async ({ page }) => {
    // Create a comprehensive item
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()

    await page.getByLabel("Name", { exact: false }).fill("Complete Item")
    await page.getByLabel("Description").fill("This is a detailed description")
    await page.getByLabel("Quantity").fill("25")
    await page.getByLabel("Category").selectOption("Food & Beverages")
    await page.getByLabel("Storage Room").selectOption("Pantry")
    await page.getByLabel("Shopping Hint").fill("Buy organic when possible")

    // Add preferred brand
    await page.getByPlaceholder("Add a brand...").fill("Premium Brand")
    await page.getByPlaceholder("Add a brand...").locator("..").getByRole("button").click()

    await page.getByRole("button", { name: "Create Item" }).click()

    // Verify all details are displayed
    await expect(page.getByText("Complete Item")).toBeVisible()
    await expect(page.getByText("This is a detailed description")).toBeVisible()
    await expect(page.getByText("25")).toBeVisible()
    // Use more specific selector for category to avoid matching the dropdown option
    await expect(page.locator("div").filter({ hasText: /^Food & Beverages$/ })).toBeVisible()
    await expect(page.getByText("Pantry")).toBeVisible()
    await expect(page.getByText("Buy organic when possible")).toBeVisible()
    await expect(page.getByText("Premium Brand")).toBeVisible()
  })

  test("modal can be closed without saving", async ({ page }) => {
    // Open modal
    await page
      .getByRole("button", { name: /Add.*item/i })
      .first()
      .click()
    await expect(page.getByRole("heading", { name: "Add Supply Item" })).toBeVisible()

    // Fill some data
    await page.getByLabel("Name", { exact: false }).fill("Unsaved Item")

    // Close with Cancel button (most reliable method)
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByRole("heading", { name: "Add Supply Item" })).toBeHidden()

    // Item should not have been created
    await expect(page.getByText("Unsaved Item")).toBeHidden()
  })
})
