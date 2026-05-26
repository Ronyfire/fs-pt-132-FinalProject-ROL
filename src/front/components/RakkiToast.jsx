import toast from "react-hot-toast";
import RakkiWaving from "../assets/img/Rakki_Waving_Sticker.png";

// Componente visual completo — control total del render
const RakkiToastUI = ({ msg, variant }) => (
  <div className={`gs-rakki-toast gs-rakki-toast--${variant}`}>
    <img src={RakkiWaving} alt="Rakki" className="gs-rakki-toast__icon" />
    <span className="gs-rakki-toast__msg">{msg}</span>
  </div>
);

export const rakkiToast = {
  success: (msg) =>
    toast.custom(<RakkiToastUI msg={msg} variant="success" />, {
      duration: 3000,
    }),

  error: (msg) =>
    toast.custom(<RakkiToastUI msg={msg} variant="error" />, {
      duration: 4000,
    }),

  info: (msg) =>
    toast.custom(<RakkiToastUI msg={msg} variant="info" />, {
      duration: 2500,
    }),
};
