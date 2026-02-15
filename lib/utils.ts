export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
