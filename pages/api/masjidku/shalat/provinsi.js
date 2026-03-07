const SHALAT_BASE_URL = process.env.SHALAT_API_BASE || process.env.NEXT_PUBLIC_SHALAT_API_BASE || 'https://equran.id/api/v2/shalat'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const response = await fetch(`${SHALAT_BASE_URL}/provinsi`)
    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status || 502).json({
        message: data?.message || 'shalat_provider_error',
      })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('SHALAT PROVINSI PROXY ERROR:', error)
    return res.status(500).json({ message: 'server_error' })
  }
}
