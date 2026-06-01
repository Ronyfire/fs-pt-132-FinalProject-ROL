export const initialStore = () => {
  return {
    message: null,
    user: null,
    token: null,
    isAuthenticated: false,

    games: [],
    selectedGame: null,
    comments: [],

    loading: false,
  };
};
export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return { ...store, message: action.payload };
    case "set_games":
      return { ...store, games: action.payload };
    case "set_auth":
      return {
        ...store,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case "set_loading":
      return {
        ...store,
        loading: action.payload,
      };

    case "set_selected_game":
      return {
        ...store,
        selectedGame: action.payload,
      };

    case "set_comments":
      return {
        ...store,
        comments: action.payload,
      };
    case "logout":
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      return {
        ...store,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case "restore_auth":
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(sessionStorage.getItem("user") || "null");
      return {
        ...store,
        user,
        token,
        isAuthenticated: !!token && !!user,
      };
    default:
      return store;
  }
}
