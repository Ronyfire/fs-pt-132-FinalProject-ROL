import React, { useState } from "react";

const CommentForm = ({
  gameId,
  parentId = null,
  buttonText = "Publish comment",
  onCommentCreated
}) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Rakki needs at least a few words before posting.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");

      const body = {
        content: content.trim()
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

      if (!response.ok) {
        throw new Error(data.msg || "Could not comment");
      }

      setContent("");

      if (onCommentCreated) {
        onCommentCreated();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="gs-comment-form mb-4">
      {error && (
        <div className="alert gs-comment-alert mb-3">
          <strong>Oops!</strong> {error}
        </div>
      )}

      <div className="position-relative">
        <textarea
          className="form-control gs-comment-textarea"
          placeholder={parentId ? "Write a reply..." : "Share your opinion with Rakki..."}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError("");
          }}
          rows={parentId ? 3 : 4}
          maxLength={500}
        />

        <span className="gs-comment-counter">
          {content.length}/500
        </span>
      </div>

      <div className="d-flex justify-content-between align-items-center gap-3 mt-3 flex-wrap">
        <small className="gs-comment-hint">
          ✦ Keep it useful, playful, and spoiler-safe.
        </small>

        <button
          type="submit"
          className="btn-gs btn-green"
          disabled={sending}
        >
          {sending ? "Posting..." : buttonText}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;