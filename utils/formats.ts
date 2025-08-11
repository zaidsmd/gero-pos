export function formatDate(date: Date | string | number, withTime: boolean = false) {
    try {
        const d = date instanceof Date ? date : new Date(date);
        if (Number.isNaN(d.getTime())) return '';
        const options: Intl.DateTimeFormatOptions = withTime
            ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
            : { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Intl.DateTimeFormat('fr-FR', options).format(d);
    } catch {
        return '';
    }
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