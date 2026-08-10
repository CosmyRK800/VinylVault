const EMAILJS_SERVICE_ID = 'service_qlj9f2a'
const EMAILJS_TEMPLATE_ID = 'template_sv84dpk'
const EMAILJS_PUBLIC_KEY = '8m53lTyoSDA_t-UTd'

export async function sendResetEmail(email, token) {
  const resetLink = `${window.location.origin}/reset-password?token=${token}`

  const templateParams = {
    to_email: email,
    reset_link: resetLink,
  }

  try {
    const emailjsModule = await import('@emailjs/browser')
    const emailjs = emailjsModule.default

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )

    return { success: true, response }
  } catch (error) {
    console.error('Eroare trimitere email reset:', error)
    return { success: false, error }
  }
}