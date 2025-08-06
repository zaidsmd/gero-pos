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