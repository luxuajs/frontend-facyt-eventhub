// Utilidades para llamadas robustas a la API

export async function safeParseJson(res, defaultErrorMsg = 'Ocurrió un error en el servidor.') {
  const contentType = res.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || defaultErrorMsg);
    }
    return data;
  } else {
    // Si la respuesta no es JSON (ej. 504 Gateway Timeout, 502 Bad Gateway o caídas de servidor)
    const text = await res.text();
    
    if (res.status === 504 || res.status === 502) {
      throw new Error(
        'Error de red: El servidor backend (puerto 3000) no se encuentra iniciado o no responde. Asegúrate de iniciar la base de datos y correr "npm run dev" en la raíz del proyecto.'
      );
    }
    
    // Si es un error genérico con respuesta de texto
    throw new Error(
      text.slice(0, 100) || `El servidor retornó un estado de error (${res.status}).`
    );
  }
}
