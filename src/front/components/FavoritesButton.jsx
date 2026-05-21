const toggleFavorite = async () => {
    try {
        await apiFetch("/api/favorite/change", {
            method: "PUT",
            body: JSON.stringify({
                game_id: game.id
            })
        })

        setFavorite(!favorite)

    } catch (error) {
        console.log(error)
    }
}