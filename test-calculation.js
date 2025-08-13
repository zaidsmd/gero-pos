// Helper function to round monetary values to 2 decimal places (0.01)
const roundToTwoDecimals = (value) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};

// Old calculation logic
const oldCalculateFinalPrice = (unitPrice, quantity, tax) => {
    // Apply tax and then multiply by quantity
    const ttc = (unitPrice * (1 + (tax || 0) / 100)) * quantity;
    
    // Round to 2 decimal places (0.01) and ensure price doesn't go negative
    return Math.max(0, roundToTwoDecimals(ttc));
};

// New calculation logic matching backend
const newCalculateFinalPrice = (unitPrice, quantity, tax) => {
    // Round HT after reduction (first rounding step in backend)
    const htReduit = roundToTwoDecimals(unitPrice);
    
    // Apply tax and round before multiplying by quantity (second rounding step in backend)
    const ttcUnit = roundToTwoDecimals(htReduit * (1 + (tax || 0) / 100));
    
    // Multiply by quantity and round final result (third rounding step in backend)
    const ttc = roundToTwoDecimals(ttcUnit * quantity);
    
    // Ensure price doesn't go negative
    return Math.max(0, ttc);
};

// Backend PHP calculation (simulated in JavaScript)
const backendCalculation = (unitPrice, quantity, tax) => {
    // First rounding: $ht = round($ht - $reduction, 2);
    const ht = roundToTwoDecimals(unitPrice);
    
    // $tva = (1 + $tva / 100);
    const tva = 1 + tax / 100;
    
    // Second rounding: $ttc = round($ht * $tva, 2) * $quantite;
    const ttcUnit = roundToTwoDecimals(ht * tva);
    
    // Third rounding: return round($ttc, 2);
    return roundToTwoDecimals(ttcUnit * quantity);
};

// Test with HT = 33.33
const testHT = 33.33;
const quantity = 1;
const tax = 20; // 20% tax

const oldResult = oldCalculateFinalPrice(testHT, quantity, tax);
const newResult = newCalculateFinalPrice(testHT, quantity, tax);
const backendResult = backendCalculation(testHT, quantity, tax);

console.log(`Test with HT = ${testHT}, Quantity = ${quantity}, Tax = ${tax}%`);
console.log(`Old calculation result: ${oldResult}`);
console.log(`New calculation result: ${newResult}`);
console.log(`Backend calculation result: ${backendResult}`);
console.log(`Difference (old vs backend): ${oldResult - backendResult}`);
console.log(`Difference (new vs backend): ${newResult - backendResult}`);

// Test with different quantities
console.log("\nTesting with different quantities:");
for (let qty = 1; qty <= 5; qty++) {
    const oldRes = oldCalculateFinalPrice(testHT, qty, tax);
    const newRes = newCalculateFinalPrice(testHT, qty, tax);
    const backendRes = backendCalculation(testHT, qty, tax);
    
    console.log(`Quantity ${qty}:`);
    console.log(`  Old: ${oldRes}, Backend: ${backendRes}, Diff: ${oldRes - backendRes}`);
    console.log(`  New: ${newRes}, Backend: ${backendRes}, Diff: ${newRes - backendRes}`);
}

// Test with different HT values
console.log("\nTesting with different HT values:");
const testValues = [33.33, 33.34, 33.35, 33.36, 33.37, 33.38, 33.39, 33.40];
for (const ht of testValues) {
    const oldRes = oldCalculateFinalPrice(ht, quantity, tax);
    const newRes = newCalculateFinalPrice(ht, quantity, tax);
    const backendRes = backendCalculation(ht, quantity, tax);
    
    console.log(`HT ${ht}:`);
    console.log(`  Old: ${oldRes}, Backend: ${backendRes}, Diff: ${oldRes - backendRes}`);
    console.log(`  New: ${newRes}, Backend: ${backendRes}, Diff: ${newRes - backendRes}`);
}

// ---------------------- Global Reduction Tests ----------------------
// Line-level price calculator (mirrors frontend/backend per-line rounding)
const lineFinalPrice = (unitPrice, quantity, reduction, reductionType, tax) => {
  let htUnit = unitPrice;
  if (reduction !== undefined && reductionType !== undefined) {
    if (reductionType === 'pourcentage') htUnit = unitPrice * (1 - reduction / 100);
    else htUnit = Math.max(0, unitPrice - reduction);
  }
  const htRounded = roundToTwoDecimals(htUnit);
  const ttcUnit = roundToTwoDecimals(htRounded * (1 + (tax || 0) / 100));
  return roundToTwoDecimals(ttcUnit * quantity);
};

// Incorrect method: apply global reduction on TTC subtotal
const cartTotalTTCGlobal = (cart, globalReduction) => {
  const subtotalTTC = roundToTwoDecimals(cart.reduce((s, it) => s + lineFinalPrice(it.unit_price, it.quantity, it.reduction, it.reductionType, it.tax), 0));
  const gr = Math.min(Math.max(globalReduction || 0, 0), 100);
  return roundToTwoDecimals(subtotalTTC * (1 - gr / 100));
};

// Correct method: apply global reduction on HT before tax, per item
const cartGrandTotalHTGlobal = (cart, globalReduction) => {
  const gr = Math.min(Math.max(globalReduction || 0, 0), 100);
  const total = cart.reduce((sum, it) => {
    let htUnit = it.unit_price;
    if (it.reduction !== undefined && it.reductionType !== undefined) {
      if (it.reductionType === 'pourcentage') htUnit = it.unit_price * (1 - it.reduction / 100);
      else htUnit = Math.max(0, it.unit_price - it.reduction);
    }
    const htAfterGlobal = htUnit * (1 - gr / 100);
    const htRounded = roundToTwoDecimals(htAfterGlobal);
    const ttcUnit = roundToTwoDecimals(htRounded * (1 + (it.tax || 0) / 100));
    const lineTotal = roundToTwoDecimals(ttcUnit * it.quantity);
    return sum + lineTotal;
  }, 0);
  return roundToTwoDecimals(total);
};

// Sample cart with mixed taxes and reductions
const sampleCart = [
  { unit_price: 100, quantity: 1, reduction: 0, reductionType: 'fixe', tax: 20 }, // 100 HT @20%
  { unit_price: 50, quantity: 2, reduction: 10, reductionType: 'pourcentage', tax: 7 }, // 10% line reduction, @7%
  { unit_price: 33.33, quantity: 3, reduction: 5, reductionType: 'fixe', tax: 0 }, // tax-exempt
];

const globalReduction = 10; // 10%

console.log('\nGlobal reduction tests (10%):');
console.log('TTC-based global (incorrect):', cartTotalTTCGlobal(sampleCart, globalReduction));
console.log('HT-based global (correct):   ', cartGrandTotalHTGlobal(sampleCart, globalReduction));
