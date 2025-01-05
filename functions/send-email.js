const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.handler = async (event) => {
  // Povolíme CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Zpracování OPTIONS requestu pro CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers
    };
  }

  try {
    if (!event.body) {
      throw new Error('Chybí tělo požadavku');
    }

    const { to, puzzleName } = JSON.parse(event.body);

    if (!to || !puzzleName) {
      throw new Error('Chybí povinné údaje');
    }

    if (!validateEmail(to)) {
      throw new Error('Neplatná e-mailová adresa');
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error('Chybí konfigurace pro odesílání e-mailů');
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
    });

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers
    };
  } catch (error) {
    console.error('Error in send-email function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Nepodařilo se odeslat e-mail',
        details: error.message
      }),
      headers
    };
  }
};