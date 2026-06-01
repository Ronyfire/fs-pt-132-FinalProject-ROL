import toast from "react-hot-toast";
import RakkiWaving    from "../assets/img/Rakki_Waving_Sticker.png";
import RakkiLove      from "../assets/img/Rakki_Love_Sticker.png";
import RakkiAngry from "../assets/img/Rakki_Angry_Sticker.png";
import RakkiConcerned from "../assets/img/Rakki_Concerned_Sticker.png";

// Mapa variante → imagen
const VARIANT_IMG = {
  success:        RakkiWaving,
  error:          RakkiAngry,
  info:           RakkiConcerned,
  favorite_add:   RakkiLove,
  favorite_remove: RakkiAngry,
};

const RakkiToastUI = ({ msg, variant = "success" }) => (
  <div className={`gs-rakki-toast gs-rakki-toast--${variant}`}>
    <img
      src={VARIANT_IMG[variant] || RakkiWaving}
      alt="Rakki"
      className="gs-rakki-toast__icon"
    />
    <span className="gs-rakki-toast__msg">{msg}</span>
  </div>
);

const show = (msg, variant, duration = 3000) =>
  toast.custom(<RakkiToastUI msg={msg} variant={variant} />, { duration });

export const rakkiToast = {
  success:        (msg) => show(msg, "success", 3000),
  error:          (msg) => show(msg, "error",   4000),
  info:           (msg) => show(msg, "info",    2500),
  favoriteAdd:    (msg) => show(msg, "favorite_add",    3000),
  favoriteRemove: (msg) => show(msg, "favorite_remove", 2500),
};
