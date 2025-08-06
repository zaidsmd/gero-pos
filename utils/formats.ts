export function formatDate(date: Date) {

}

export function formatNumber(number: number,currency:boolean = false) {
    const style = currency ? 'currency' : 'decimal';
    // Always use 2 decimal places for consistency with the 0.01 rounding requirement
    return new Intl.NumberFormat('fr-FR',{
        currency:'MAD',
        currencyDisplay:'symbol',
        style:style,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}