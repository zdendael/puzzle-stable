import { toast } from 'react-hot-toast'

const baseUrl = import.meta.env.DEV 
  ? 'http://localhost:8888'
  : 'https://pocmaranapuzzlarka.netlify.app'

export async function sendReservationEmail(to: string, puzzleName: string) {
  try {
    console.log('Sending reservation email to:', to)
    const response = await fetch(`${baseUrl}/.netlify/functions/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        to: to.trim(),
        puzzleName: puzzleName.trim() 
      })
    })

    if (!response.ok) {
      let errorMessage = 'Nepodařilo se odeslat e-mail'
      try {
        const errorData = await response.json()
        if (errorData?.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        console.error('Error parsing error response:', e)
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error sending email:', error)
    toast.error('Nepodařilo se odeslat potvrzovací e-mail. Zkuste to prosím později.')
    throw error
  }
}