export function formatDate(date: Date) {

}

export function formatNumber(number: number,currency:boolean = false) {
    const style = currency ? 'currency' : 'decimal';
     return new Intl.NumberFormat('fr-FR',{currency:'MAD',currencyDisplay:'symbol',style:style}).format(number);
}