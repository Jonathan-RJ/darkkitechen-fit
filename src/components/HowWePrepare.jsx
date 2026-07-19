export default function HowWePrepare({ menu }) {
  return (
    <section className="glass-section prep-section">
      <div>
        <p className="eyebrow">Transparencia</p>
        <h2>{menu.preparacion.titulo}</h2>
      </div>
      <div className="prep-grid">
        <div className="prep-points">
          {menu.preparacion.puntos.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </div>
        <div className="video-grid">
          {menu.preparacion.videos.map((video) => (
            <div className="video-slot" key={video.titulo}>
              {video.url ? (
                <iframe src={video.url} title={video.titulo} allowFullScreen />
              ) : (
                <div>
                  <span>Video</span>
                  <strong>{video.titulo}</strong>
                  <small>Agrega la URL en menu.json</small>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
