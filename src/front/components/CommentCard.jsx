import React, { useState } from "react";
import CommentForm from "./CommentForm";

const CommentCard = ({
    comment,
    replies = [],
    gameId,
    currentUser,
    isAdmin,
    onRefresh
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [message, setMessage] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const canDelete = currentUser?.id === comment.user_id || isAdmin;
    const canReport = currentUser && currentUser.id !== comment.user_id;

    const handleDelete = async () => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(`${backendUrl}/api/comments/${comment.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Could not delete comment");
            }

            if (onRefresh) onRefresh();

        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleReport = async (event) => {
        event.preventDefault();

        if (!reportReason.trim()) {
            setMessage("Report reason is required");
            return;
        }

        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch(`${backendUrl}/api/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    comment_id: comment.id,
                    reason: reportReason
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Could not report comment");
            }

            setMessage("Comment reported successfully.");
            setReportReason("");
            setShowReportForm(false);

        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="card mb-3">
            <div className="card-body">

                <div className="d-flex justify-content-between">
                    <strong>{comment.username || "Unknown user"}</strong>
                    <small>{new Date(comment.created_at).toLocaleString()}</small>
                </div>

                <p className="mt-2">{comment.content}</p>

                {message && (
                    <div className="alert alert-info py-1">
                        {message}
                    </div>
                )}

                <div className="d-flex gap-2 mb-2">
                    {currentUser && (
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            Reply
                        </button>
                    )}

                    {canDelete && (
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    )}

                    {canReport && (
                        <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => setShowReportForm(!showReportForm)}
                        >
                            Report
                        </button>
                    )}
                </div>

                {showReplyForm && (
                    <CommentForm
                        gameId={gameId}
                        parentId={comment.id}
                        buttonText="Publish reply"
                        onCommentCreated={() => {
                            setShowReplyForm(false);
                            if (onRefresh) onRefresh();
                        }}
                    />
                )}

                {showReportForm && (
                    <form onSubmit={handleReport} className="mt-2">
                        <textarea
                            className="form-control mb-2"
                            placeholder="Explain why you are reporting this comment..."
                            value={reportReason}
                            onChange={(event) => setReportReason(event.target.value)}
                        />

                        <button className="btn btn-sm btn-warning">
                            Send Report
                        </button>
                    </form>
                )}

                {replies.length > 0 && (
                    <div className="mt-3 ms-4 border-start ps-3">
                        {replies.map((reply) => (
                            <CommentCard
                                key={reply.id}
                                comment={reply}
                                replies={[]}
                                gameId={gameId}
                                currentUser={currentUser}
                                isAdmin={isAdmin}
                                onRefresh={onRefresh}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default CommentCard;