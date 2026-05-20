const submitComment = async () => {

    await apiFetch(`/api/games/${gameId}/comments`, {
        method: "POST",
        body: JSON.stringify({
            content,
            parent_id
        })
    })
}