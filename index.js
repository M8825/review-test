//--------------------------------
// Arrange: Go to https://modcloth.com/
//--------------------------------
const { context } = await launch()
const page = await context.newPage()
await page.goto(`https://modcloth.com/`)

//--------------------------------
// Act: Add second item in the catalog to the chart
//--------------------------------
// Navigate to the BEST SELLERS page and add the second dress in the catalog to the cart
await page.getByLabel('Nav Link to BEST SELLERS', { exact: true }).click();
await page.locator('.collection-products > div').nth(1).click();
await page.locator('#product-option-product_options_WPxAUp div').filter({ hasText: 'M' }).nth(2).click(); // Select size M
await page.locator(`:text("Add To Bag")`).click();
const numberOfItemsInCart = await page.locator('.cart-content-wrapper > div').count();

// Assert that the recent item was added to the cart
expect(numberOfItemsInCart).toBe(1);

// Update the item in the cart
await page.getByRole('link', { name: 'View Cart' }).click();
await page.getByText('+', { exact: true }).click(); // Increment quantity

// Edit size of the item
await page.getByText('Edit').click();
await page.getByLabel('Single select').click();
const lastOption = await page.getByLabel('Single select').getByRole('option').last().textContent(); // Select last option text
await page.getByLabel('Single select').selectOption(lastOption);
await page.waitForTimeout(3000)

// Remove  item from the cart
await page.locator('a.remove-cart-item-link:text("Remove")').waitFor({ state: 'visible' });
await page.locator('a.remove-cart-item-link:text("Remove")').click();
await page.waitForTimeout(3000)
const updateNumberOfItemsInCart = await page.locator('.cart-content-wrapper > div').count();

// Assert: the cart is empty
expect(updateNumberOfItemsInCart).toBe(0);

// go to the BEST SELLERS page and sort catalog by price
await page.getByLabel('Nav Link to BEST SELLERS', { exact: true }).click();

async function sortable(sortType, page) {
  await page.getByRole('combobox', { name: 'Sort By' }).click();
  await page.getByText(sortType, { exact: true }).click();

  // Log the count of items whose class starts with "item"
  const prices = page.locator('.collection-products div[class^="item"] span[class="price"]');
  const priceCount = await prices.count();
  const pricesText = await prices.allTextContents();

  const numPrices = []
  for (let i = 0; i < priceCount; i++) {
    let price = pricesText[i].split("$").join("")
    numPrices.push(Number(price))
  }
  console.log("numPrices: ", numPrices)
  for (let i = 1; i < numPrices.length; i++) {
    if (sortType === "Lowest - Highest") {
      expect(numPrices[i] >= numPrices[i - 1]).toBe(true)
    } else {
      expect(numPrices[i] <= numPrices[i - 1]).toBe(true)
    }
  }

  console.log("Sort type: ", sortType)
}

//--------------------------------
// Assert: Catalog of items is sorted correctly
//--------------------------------

// Sort and assert items are sorted from lowest price to highest
await sortable("Lowest - Highest", page)

// Sort and assert items are sorted from highest price to lowest
await sortable("Highest - Lowest", page)
