import cloudinary.uploader
from flask import request, jsonify
from api.routes import api
from flask_jwt_extended import jwt_required

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@api.route("/upload", methods=["POST"])
@jwt_required()
def upload_image():
    if "file" not in request.files:
        return jsonify({"msg": "No file provided", "success": False}), 400

    file = request.files["file"]

    if not file or file.filename == "":
        return jsonify({"msg": "Empty filename", "success": False}), 400

    if not allowed_file(file.filename):
        return jsonify({"msg": "File type not allowed. Use png, jpg, jpeg, gif or webp", "success": False}), 400

    try:
        result = cloudinary.uploader.upload(
            file,
            folder="gameside",
            transformation=[{"width": 900, "crop": "limit"}],
            resource_type="image"
        )
        return jsonify({
            "success": True,
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }), 200

    except Exception as e:
        return jsonify({"msg": f"Upload failed: {str(e)}", "success": False}), 500