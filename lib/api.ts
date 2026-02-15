export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}
