import { Handler } from '@netlify/functions'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    if (!event.body) {
      throw new Error('Chybí tělo požadavku')
    }

    const { to, puzzleName } = JSON.parse(event.body)

    if (!to || !puzzleName) {
      throw new Error('Chybí povinné údaje')
    }

    if (!validateEmail(to)) {
      throw new Error('Neplatná e-mailová adresa')
    }

    const data = await resend.emails.send({
      from: 'Puzzle kolekce <puzzlekolekce@resend.dev>',
      to: [to],
      subject: `Rezervace puzzle "${puzzleName}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Potvrzení rezervace puzzle</h1>
          <p>Dobrý den,</p>
          <p>potvrzujeme Vaši rezervaci puzzle <strong>${puzzleName}</strong> z naší sbírky.</p>
          <p>O dalším postupu Vás budeme informovat.</p>
          <p style="margin-top: 24px;">
            S pozdravem,<br>
            Puzzle kolekce
          </p>
        </div>
      `
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    }
  } catch (error) {
    console.error('Error in send-email function:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Nepodařilo se odeslat e-mail',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}