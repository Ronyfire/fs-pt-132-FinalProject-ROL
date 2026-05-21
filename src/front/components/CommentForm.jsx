import React, { useState } from "react";

const CommentForm = ({
    gameId,
    parentId = null,
    buttonText = "Publish comment",
    onCommentCreated
}) => {
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        try {
            const token = sessionStorage.getItem("token");

            const body = {
                content
            };

            if (parentId) {
                body.parent_id = parentId;
            }

            const response = await fetch(`${backendUrl}/api/games/${gameId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.msg || "Could not comment");

            setContent("");
            setError("");

            if (onCommentCreated) {
                onCommentCreated();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-3">
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <textarea
                className="form-control mb-2"
                placeholder={parentId ? "Write a response..." : "Write your opinion..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <button className="btn btn-primary btn-sm">
                {buttonText}
            </button>
        </form>
    );
};

export default CommentForm;