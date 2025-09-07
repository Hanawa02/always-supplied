import { expect, test } from '@playwright/test'

test.describe('Supply Configuration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')
  })

  test('displays the main page elements', async ({ page }) => {
    // Check main title is present
    await expect(page.locator('h1')).toContainText('Supply Configuration')
    
    // Check add button is present
    await expect(page.locator('button', { hasText: 'Add Supply Item' })).toBeVisible()
    
    // Check stats card is present
    await expect(page.locator('text=Total Items')).toBeVisible()
    
    // Check search input is present
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
    
    // Check category filter is present
    await expect(page.locator('select', { hasText: 'All Categories' })).toBeVisible()
  })

  test('shows empty state when no items exist', async ({ page }) => {
    // Should show empty state message
    await expect(page.locator('text=No supply items yet')).toBeVisible()
    await expect(page.locator('text=Start building your supply inventory')).toBeVisible()
    
    // Should show add first item button
    await expect(page.locator('button', { hasText: 'Add your first item' })).toBeVisible()
  })

  test('can create a new supply item', async ({ page }) => {
    // Click add button (either main button or empty state button)
    const addButton = page.locator('button', { hasText: /Add.*item/i }).first()
    await addButton.click()
    
    // Modal should open
    await expect(page.locator('text=Add Supply Item')).toBeVisible()
    
    // Fill out the form
    await page.fill('input#name', 'Test Paper Towels')
    await page.fill('textarea#description', 'High quality paper towels for kitchen use')
    await page.fill('input#quantity', '12')
    
    // Select category
    await page.selectOption('select#category', 'Cleaning Supplies')
    
    // Select storage room
    await page.selectOption('select#storage-room', 'Kitchen')
    
    // Add shopping hint
    await page.fill('textarea#shopping-hint', 'Buy when on sale')
    
    // Add preferred brand
    await page.fill('input[placeholder="Add a brand..."]', 'Bounty')
    await page.click('button:has(i.i-mdi\\:plus )')
    
    // Verify brand was added
    await expect(page.locator('text=Bounty')).toBeVisible()
    
    // Submit the form
    await page.click('button[type="submit"]')
    
    // Modal should close and item should appear in the list
    await expect(page.locator('text=Add Supply Item')).not.toBeVisible()
    await expect(page.locator('text=Test Paper Towels')).toBeVisible()
    await expect(page.locator('text=12')).toBeVisible() // quantity
    
    // Stats should update
    await expect(page.locator('text=1').first()).toBeVisible() // total items count
  })

  test('can edit an existing supply item', async ({ page }) => {
    // First create an item
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    await page.fill('input#name', 'Original Item')
    await page.fill('input#quantity', '5')
    await page.click('button[type="submit"]')
    
    // Wait for item to appear
    await expect(page.locator('text=Original Item')).toBeVisible()
    
    // Click edit button
    await page.click('button[title="Edit item"]')
    
    // Modal should open with existing data
    await expect(page.locator('text=Edit Supply Item')).toBeVisible()
    await expect(page.locator('input#name')).toHaveValue('Original Item')
    
    // Edit the item
    await page.fill('input#name', 'Updated Item')
    await page.fill('input#quantity', '10')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify changes
    await expect(page.locator('text=Updated Item')).toBeVisible()
    await expect(page.locator('text=Original Item')).not.toBeVisible()
    await expect(page.locator('text=10')).toBeVisible()
  })

  test('can delete a supply item', async ({ page }) => {
    // First create an item
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    await page.fill('input#name', 'Item to Delete')
    await page.fill('input#quantity', '3')
    await page.click('button[type="submit"]')
    
    // Wait for item to appear
    await expect(page.locator('text=Item to Delete')).toBeVisible()
    
    // Click delete button
    await page.click('button[title="Delete item"]')
    
    // Confirmation modal should appear
    await expect(page.locator('text=Delete Item')).toBeVisible()
    await expect(page.locator('text=Item to Delete').nth(1)).toBeVisible() // in confirmation message
    
    // Confirm deletion
    await page.click('button', { hasText: 'Delete' })
    
    // Item should be removed
    await expect(page.locator('text=Item to Delete')).not.toBeVisible()
    
    // Should return to empty state
    await expect(page.locator('text=No supply items yet')).toBeVisible()
  })

  test('can search for items', async ({ page }) => {
    // Create multiple items
    const items = [
      { name: 'Paper Towels', quantity: '5' },
      { name: 'Dish Soap', quantity: '2' },
      { name: 'Toilet Paper', quantity: '8' }
    ]
    
    for (const item of items) {
      await page.locator('button', { hasText: /Add.*item/i }).first().click()
      await page.fill('input#name', item.name)
      await page.fill('input#quantity', item.quantity)
      await page.click('button[type="submit"]')
      await expect(page.locator(`text=${item.name}`)).toBeVisible()
    }
    
    // Search for "Paper"
    await page.fill('input[placeholder*="Search"]', 'Paper')
    
    // Should show both paper items
    await expect(page.locator('text=Paper Towels')).toBeVisible()
    await expect(page.locator('text=Toilet Paper')).toBeVisible()
    await expect(page.locator('text=Dish Soap')).not.toBeVisible()
    
    // Clear search
    await page.fill('input[placeholder*="Search"]', '')
    
    // All items should be visible again
    await expect(page.locator('text=Paper Towels')).toBeVisible()
    await expect(page.locator('text=Dish Soap')).toBeVisible()
    await expect(page.locator('text=Toilet Paper')).toBeVisible()
  })

  test('can filter by category', async ({ page }) => {
    // Create items with different categories
    const items = [
      { name: 'Paper Towels', category: 'Cleaning Supplies' },
      { name: 'Pasta', category: 'Food & Beverages' },
      { name: 'Dish Soap', category: 'Cleaning Supplies' }
    ]
    
    for (const item of items) {
      await page.locator('button', { hasText: /Add.*item/i }).first().click()
      await page.fill('input#name', item.name)
      await page.fill('input#quantity', '1')
      await page.selectOption('select#category', item.category)
      await page.click('button[type="submit"]')
      await expect(page.locator(`text=${item.name}`)).toBeVisible()
    }
    
    // Filter by Cleaning Supplies
    await page.selectOption('select:has(option:text("All Categories"))', 'Cleaning Supplies')
    
    // Should show only cleaning items
    await expect(page.locator('text=Paper Towels')).toBeVisible()
    await expect(page.locator('text=Dish Soap')).toBeVisible()
    await expect(page.locator('text=Pasta')).not.toBeVisible()
    
    // Reset filter
    await page.selectOption('select:has(option:text("All Categories"))', '')
    
    // All items should be visible again
    await expect(page.locator('text=Paper Towels')).toBeVisible()
    await expect(page.locator('text=Pasta')).toBeVisible()
    await expect(page.locator('text=Dish Soap')).toBeVisible()
  })

  test('shows no items found state when search/filter returns empty', async ({ page }) => {
    // Create an item
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    await page.fill('input#name', 'Test Item')
    await page.fill('input#quantity', '1')
    await page.click('button[type="submit"]')
    
    // Search for something that doesn't exist
    await page.fill('input[placeholder*="Search"]', 'NonExistentItem')
    
    // Should show no items found state
    await expect(page.locator('text=No items found')).toBeVisible()
    await expect(page.locator('text=Try adjusting your search')).toBeVisible()
    
    // Should not show the "add first item" button in this state
    await expect(page.locator('button', { hasText: 'Add your first item' })).not.toBeVisible()
  })

  test('handles form validation', async ({ page }) => {
    // Open modal
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    
    // Try to submit without required fields
    await page.click('button[type="submit"]')
    
    // Should show browser validation or alert (depending on implementation)
    // The form should not submit and modal should remain open
    await expect(page.locator('text=Add Supply Item')).toBeVisible()
    
    // Try with just spaces in name
    await page.fill('input#name', '   ')
    await page.fill('input#quantity', '5')
    await page.click('button[type="submit"]')
    
    // Should show validation message or alert
    await expect(page.locator('text=Add Supply Item')).toBeVisible()
    
    // Try with negative quantity
    await page.fill('input#name', 'Valid Name')
    await page.fill('input#quantity', '-1')
    await page.click('button[type="submit"]')
    
    // Should show validation message or alert
    await expect(page.locator('text=Add Supply Item')).toBeVisible()
  })

  test('can add custom category and storage room', async ({ page }) => {
    // Open modal
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    
    // Fill required fields
    await page.fill('input#name', 'Custom Item')
    await page.fill('input#quantity', '1')
    
    // Select custom category option
    await page.selectOption('select#category', 'custom')
    
    // Custom category input should appear
    await expect(page.locator('input[placeholder="Enter custom category..."]')).toBeVisible()
    
    // Enter custom category
    await page.fill('input[placeholder="Enter custom category..."]', 'My Custom Category')
    await page.keyboard.press('Enter')
    
    // Custom category input should disappear
    await expect(page.locator('input[placeholder="Enter custom category..."]')).not.toBeVisible()
    
    // Select custom storage room option
    await page.selectOption('select#storage-room', 'custom')
    
    // Custom storage room input should appear
    await expect(page.locator('input[placeholder="Enter custom storage room..."]')).toBeVisible()
    
    // Enter custom storage room
    await page.fill('input[placeholder="Enter custom storage room..."]', 'My Custom Room')
    await page.keyboard.press('Enter')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify item was created with custom values
    await expect(page.locator('text=Custom Item')).toBeVisible()
    await expect(page.locator('text=My Custom Category')).toBeVisible()
    await expect(page.locator('text=My Custom Room')).toBeVisible()
  })

  test('can manage preferred brands', async ({ page }) => {
    // Open modal
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    
    // Fill required fields
    await page.fill('input#name', 'Branded Item')
    await page.fill('input#quantity', '1')
    
    // Add multiple brands
    const brands = ['Brand A', 'Brand B', 'Brand C']
    
    for (const brand of brands) {
      await page.fill('input[placeholder="Add a brand..."]', brand)
      await page.click('button:has(i.i-mdi\\:plus )')
      await expect(page.locator(`text=${brand}`)).toBeVisible()
    }
    
    // Remove middle brand
    await page.locator('text=Brand B').locator('..').locator('button:has(i.i-mdi\\:close )').click()
    await expect(page.locator('text=Brand B')).not.toBeVisible()
    
    // Verify other brands still exist
    await expect(page.locator('text=Brand A')).toBeVisible()
    await expect(page.locator('text=Brand C')).toBeVisible()
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify brands appear in the item display
    await expect(page.locator('text=Brand A')).toBeVisible()
    await expect(page.locator('text=Brand C')).toBeVisible()
    await expect(page.locator('text=Brand B')).not.toBeVisible()
  })

  test('displays item details correctly', async ({ page }) => {
    // Create a comprehensive item
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    
    await page.fill('input#name', 'Complete Item')
    await page.fill('textarea#description', 'This is a detailed description')
    await page.fill('input#quantity', '25')
    await page.selectOption('select#category', 'Food & Beverages')
    await page.selectOption('select#storage-room', 'Pantry')
    await page.fill('textarea#shopping-hint', 'Buy organic when possible')
    
    // Add preferred brand
    await page.fill('input[placeholder="Add a brand..."]', 'Premium Brand')
    await page.click('button:has(i.i-mdi\\:plus )')
    
    await page.click('button[type="submit"]')
    
    // Verify all details are displayed
    await expect(page.locator('text=Complete Item')).toBeVisible()
    await expect(page.locator('text=This is a detailed description')).toBeVisible()
    await expect(page.locator('text=25')).toBeVisible()
    await expect(page.locator('text=Food & Beverages')).toBeVisible()
    await expect(page.locator('text=Pantry')).toBeVisible()
    await expect(page.locator('text=Buy organic when possible')).toBeVisible()
    await expect(page.locator('text=Premium Brand')).toBeVisible()
  })

  test('modal can be closed without saving', async ({ page }) => {
    // Open modal
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    await expect(page.locator('text=Add Supply Item')).toBeVisible()
    
    // Fill some data
    await page.fill('input#name', 'Unsaved Item')
    
    // Close with X button
    await page.click('button:has(i.i-mdi\\:close )')
    await expect(page.locator('text=Add Supply Item')).not.toBeVisible()
    
    // Item should not have been created
    await expect(page.locator('text=Unsaved Item')).not.toBeVisible()
    
    // Open modal again
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    await page.fill('input#name', 'Another Unsaved Item')
    
    // Close with Cancel button
    await page.click('button', { hasText: 'Cancel' })
    await expect(page.locator('text=Add Supply Item')).not.toBeVisible()
    
    // Item should not have been created
    await expect(page.locator('text=Another Unsaved Item')).not.toBeVisible()
    
    // Close by clicking overlay
    await page.locator('button', { hasText: /Add.*item/i }).first().click()
    await page.fill('input#name', 'Third Unsaved Item')
    
    // Click on the overlay (background)
    await page.click('.fixed.inset-0.bg-gray-500.bg-opacity-75')
    await expect(page.locator('text=Add Supply Item')).not.toBeVisible()
    
    // Item should not have been created
    await expect(page.locator('text=Third Unsaved Item')).not.toBeVisible()
  })
})