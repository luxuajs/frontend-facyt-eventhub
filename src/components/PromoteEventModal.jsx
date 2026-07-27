import React, { useState, useEffect } from 'react';

export default function PromoteEventModal({ evento, onClose, token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('instagram'); // 'instagram' | 'facebook' | 'whatsapp'
  const [instagramCopy, setInstagramCopy] = useState('');
  const [facebookCopy, setFacebookCopy] = useState('');
  const [whatsappCopy, setWhatsappCopy] = useState('');
  const [bannerSvg, setBannerSvg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!evento || !evento.id) return;
    fetchPromoData();
  }, [evento]);

  const fetchPromoData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/eventos/${evento.id}/promocion`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar la promoción del evento');
      }

      setInstagramCopy(data.instagramCopy || '');
      setFacebookCopy(data.facebookCopy || '');
      setBannerSvg(data.bannerSvg || '');

      // Generar una versión más directa para WhatsApp
      const fechaStr = evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-VE') : '';
      setWhatsappCopy(
        `📢 *¡EVENTO EN FACYT!* 🎓\n\n` +
        `*${evento.titulo}*\n` +
        `📌 *Tipo:* ${evento.tipo}\n` +
        `📅 *Fecha:* ${fechaStr}\n` +
        `⏰ *Horario:* ${evento.horaInicio} - ${evento.horaFin}\n` +
        `📍 *Lugar:* ${evento.espacio?.nombre || 'FaCyT UC'}\n\n` +
        `¡Acompáñanos en esta actividad académica!`
      );
    } catch (err) {
      console.error('Error fetching promo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActiveText = () => {
    if (activeTab === 'instagram') return instagramCopy;
    if (activeTab === 'facebook') return facebookCopy;
    return whatsappCopy;
  };

  const setActiveText = (val) => {
    if (activeTab === 'instagram') setInstagramCopy(val);
    else if (activeTab === 'facebook') setFacebookCopy(val);
    else setWhatsappCopy(val);
  };

  const handleCopyText = async () => {
    const textToCopy = getActiveText();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadBanner = () => {
    if (!bannerSvg) return;
    
    // Usamos Data URI con codificación Base64 en lugar de Blob URL para evitar
    // que el navegador marque el canvas como "tainted" debido al foreignObject del SVG.
    const svgUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(bannerSvg)))}`;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, 1080, 1080);
      ctx.drawImage(img, 0, 0, 1080, 1080);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `Promocion_FaCyT_${(evento.titulo || 'Evento').replace(/\s+/g, '_')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
        }
      }, 'image/png');
    };
    img.src = svgUrl;
  };

  const handleOpenSocial = () => {
    const text = encodeURIComponent(getActiveText());
    if (activeTab === 'instagram') {
      window.open('https://www.instagram.com/', '_blank');
    } else if (activeTab === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
    } else if (activeTab === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Header con gradiente */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-pink-900/60 stroke-slate-700 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wider uppercase rounded-full border border-indigo-500/30">
              DIFUSIÓN E INTELIGENCIA ARTIFICIAL
            </span>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Evento Aprobado
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Promocionar Evento: <span className="text-indigo-400">{evento.titulo}</span>
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Generá material publicitario listo para publicar en tus redes sociales con copy inteligente y banner profesional.
          </p>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-slate-300 text-sm font-medium animate-pulse">
                Gemini AI está diseñando los contenidos promocionales...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-300 text-center space-y-3">
              <p className="font-semibold">{error}</p>
              <button
                onClick={fetchPromoData}
                className="px-4 py-2 bg-red-800/60 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Columna Izquierda: Copys y Redes */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Selector de Pestaña de Red Social */}
                <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('instagram')}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                      activeTab === 'instagram'
                        ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>📸</span> Instagram
                  </button>
                  <button
                    onClick={() => setActiveTab('facebook')}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                      activeTab === 'facebook'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>📘</span> Facebook
                  </button>
                  <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                      activeTab === 'whatsapp'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>💬</span> WhatsApp
                  </button>
                </div>

                {/* Editor / Vista previa de texto */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Copy sugerido por Gemini AI ({activeTab.toUpperCase()})
                    </label>
                    <span className="text-xs text-slate-500">Podés editar el texto si querés</span>
                  </div>
                  <textarea
                    rows={8}
                    value={getActiveText()}
                    onChange={(e) => setActiveText(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 text-sm leading-relaxed focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
                  />
                </div>

                {/* Botones de Acción para el Texto */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCopyText}
                    className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    {copied ? (
                      <>
                        <span>✓</span> ¡Texto Copiado!
                      </>
                    ) : (
                      <>
                        <span>📋</span> Copiar Texto
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleOpenSocial}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <span>📲</span> Abrir {activeTab === 'instagram' ? 'Instagram' : activeTab === 'facebook' ? 'Facebook' : 'WhatsApp'}
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Banner Visual Promocional */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Banner Oficial del Evento (1:1)
                    </label>
                    <span className="text-xs text-emerald-400 font-semibold">Listo para postear</span>
                  </div>

                  {/* Previsualizador de Banner */}
                  <div className="relative group bg-slate-950 p-2 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    {bannerSvg ? (
                      <div
                        className="w-full aspect-square rounded-xl overflow-hidden shadow-md [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                        dangerouslySetInnerHTML={{ __html: bannerSvg }}
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-slate-600 text-sm">
                        Sin vista previa
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de Descarga */}
                <div className="space-y-2">
                  <button
                    onClick={handleDownloadBanner}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
                  >
                    <span>📥</span> Descargar Banner Promocional (.PNG)
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm rounded-xl transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
