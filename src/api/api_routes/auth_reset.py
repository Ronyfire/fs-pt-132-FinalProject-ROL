import random
import string
from datetime import datetime, timedelta
from flask import request, jsonify
from flask_mail import Message
from api.models import db, User
from extensions import mail
from api.routes import api
from extensions import bcrypt

# ── POST /api/auth/forgot-password ───────────────────────────
@api.route("/auth/forgot-password", methods=["POST"])
def forgot_password():
    data  = request.get_json()
    email = data.get("email", "").strip().lower()

    user = User.query.filter_by(email=email).first()

    if user:
        code   = "".join(random.choices(string.digits, k=5))
        expiry = datetime.utcnow() + timedelta(minutes=15)

        user.reset_code        = code
        user.reset_code_expiry = expiry
        db.session.commit()

        msg = Message(
            subject="Game-Side — Password Reset Code",
            recipients=[email],
            html=f"""
            <div style="font-family:Inter,sans-serif;background:#0D0F1F;color:#F0F0F0;padding:2rem;border-radius:8px;max-width:400px;margin:auto">
              <h2 style="color:#7DD750;margin-top:0">Game-Side</h2>
              <p>Your password reset code is:</p>
              <div style="font-size:2.5rem;font-weight:800;letter-spacing:0.5rem;color:#7DD750;text-align:center;padding:1rem;background:#111326;border-radius:8px;border:1px solid rgba(125,215,80,0.3)">
                {code}
              </div>
              <p style="color:#888;font-size:0.875rem;margin-top:1rem">
                This code expires in <strong style="color:#F0F0F0">15 minutes</strong>.<br>
                If you didn't request this, ignore this email.
              </p>
            </div>
            """
        )
        mail.send(msg)

    return jsonify({"msg": "If that email exists, a code has been sent."}), 200


# ── POST /api/auth/verify-code ────────────────────────────────
@api.route("/auth/verify-code", methods=["POST"])
def verify_code():
    data  = request.get_json()
    email = data.get("email", "").strip().lower()
    code  = data.get("code", "").strip()

    user = User.query.filter_by(email=email).first()

    if not user or not user.reset_code:
        return jsonify({"msg": "Invalid or expired code."}), 400

    if user.reset_code_expiry < datetime.utcnow():
        user.reset_code        = None
        user.reset_code_expiry = None
        db.session.commit()
        return jsonify({"msg": "Code expired. Please request a new one."}), 400

    if user.reset_code != code:
        return jsonify({"msg": "Invalid code."}), 400

    return jsonify({"msg": "Code verified."}), 200


# ── POST /api/auth/reset-password ────────────────────────────
@api.route("/auth/reset-password", methods=["POST"])
def reset_password():
    data         = request.get_json()
    email        = data.get("email", "").strip().lower()
    code         = data.get("code", "").strip()
    new_password = data.get("new_password", "")

    if len(new_password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters."}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.reset_code:
        return jsonify({"msg": "Invalid request."}), 400

    if user.reset_code_expiry < datetime.utcnow():
        return jsonify({"msg": "Code expired."}), 400

    if user.reset_code != code:
        return jsonify({"msg": "Invalid code."}), 400

    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.reset_code        = None
    user.reset_code_expiry = None
    db.session.commit()

    return jsonify({"msg": "Password updated successfully."}), 200
