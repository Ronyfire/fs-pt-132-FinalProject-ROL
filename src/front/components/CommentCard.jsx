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

    const isReply = Boolean(comment.parent_id);
    const canDelete = currentUser?.id === comment.user_id || isAdmin;
    const canReport = currentUser && currentUser.id !== comment.user_id;
    const commentRole = comment.is_admin ? "GAME-SIDE ADMIN" : "GAME-SIDE PLAYER";

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
        <article className="card gs-comment-card">
            <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between gap-3 align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="gs-comment-avatar">
                            {comment.avatar_url ? (
                                <img
                                    src={comment.avatar_url}
                                    alt={`${comment.username || "User"} avatar`}
                                />
                            ) : (
                                <span>
                                    {(comment.username || "?").charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div>
                            <h5 className="gs-comment-author mb-1">
                                {comment.username || "Unknown user"}
                            </h5>

                            <small className={`gs-comment-role ${comment.is_admin ? "admin" : "player"}`}>
                                {commentRole}
                            </small>
                        </div>
                    </div>

                    <time className="gs-comment-date">
                        {new Date(comment.created_at).toLocaleString()}
                    </time>
                </div>

                <p className="gs-comment-content">
                    {comment.content}
                </p>

                {message && (
                    <div className="alert gs-comment-message py-2 mb-3">
                        {message}
                    </div>
                )}

                <div className="d-flex gap-2 flex-wrap">
                    {currentUser && !isReply && (
                        <button
                            type="button"
                            className="btn btn-sm gs-comment-action"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            {showReplyForm ? "Cancel reply" : "Reply"}
                        </button>
                    )}

                    {canDelete && (
                        <button
                            type="button"
                            className="btn btn-sm gs-comment-action danger"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    )}

                    {canReport && (
                        <button
                            type="button"
                            className="btn btn-sm gs-comment-action warning"
                            onClick={() => setShowReportForm(!showReportForm)}
                        >
                            Report
                        </button>
                    )}
                </div>

                {showReplyForm && (
                    <div className="gs-comment-nested-form mt-3">
                        <CommentForm
                            gameId={gameId}
                            parentId={comment.id}
                            buttonText="Publish reply"
                            onCommentCreated={() => {
                                setShowReplyForm(false);
                                if (onRefresh) onRefresh();
                            }}
                        />
                    </div>
                )}

                {showReportForm && (
                    <form onSubmit={handleReport} className="gs-report-form mt-3">
                        <textarea
                            className="form-control gs-comment-textarea"
                            placeholder="Explain why you are reporting this comment..."
                            value={reportReason}
                            onChange={(event) => setReportReason(event.target.value)}
                            rows={3}
                        />

                        <button type="submit" className="btn btn-sm gs-comment-action warning mt-2">
                            Send Report
                        </button>
                    </form>
                )}

                {replies.length > 0 && (
                    <div className="gs-comment-replies mt-4">
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
        </article>
    );
};

export default CommentCard;