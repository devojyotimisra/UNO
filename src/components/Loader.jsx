import "./Loader.css";

export default function Loader({ size = "medium", text, fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-spinner large" />
        {text && <div className="loader-text">{text}</div>}
      </div>
    );
  }

  return (
    <div className="loader-wrapper">
      <div className={`loader-spinner ${size}`} />
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
}
