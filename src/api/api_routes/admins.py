from flask import request, jsonify
from api.models import db, User, Ban, AddGame, Game
from api.routes import api
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from datetime import datetime
from api.api_routes.igdb import search_igdb_games, create_game_from_igdb #<--lo de la api

def admin_required():

    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    return current_user and current_user.is_admin

@api.route("/admin/addgames", methods=["GET"])
@jwt_required()
def get_pending_addgames():

    if not admin_required():
        return jsonify({"msg": "Admin access required", "success": False}), 403

    submissions = db.session.execute(select(AddGame).where(
        AddGame.status == "pending")).scalars().all()

    return jsonify({"success": True, "submissions": [
        submission.serialize() for submission in submissions
    ]}), 200

@api.route("/admin/addgames/<int:addgame_id>", methods=['PUT'])
@jwt_required()
def update_addgame_status(addgame_id):

    if not admin_required():
        return jsonify({"msg": "Admin access required", "success": False}), 403

    add_game = db.session.get(AddGame, addgame_id)

    if not add_game:
        return jsonify({"msg": "Submission not found", "success": False}), 404

    body = request.get_json()

    if not body or "status" not in body:
        return jsonify({"msg": "Status is required", "success": False}), 400

    if body["status"] not in ["approved", "rejected"]:
        return jsonify({"msg": "Invalid status", "success": False}), 400

    if add_game.status != "pending":
        return jsonify({"msg": "Submission already processed", "success": False}), 400

    add_game.status = body["status"]

    # Have to create a code for working only if aproved to add the game successfuly

    if body["status"] == "approved":
        data = add_game.body
        if add_game.creator:

            new_game = Game(
                title=data["title"],
                description=data["description"],
                release_date=datetime.fromisoformat(data["release_date"]),
                developer=data["developer"],
                publisher=data["publisher"],
                cover_img_url=data["cover_img_url"],
                genres=data["genres"],
                platforms=data["platforms"]
            )
            db.session.add(new_game)

        elif add_game.update:

            game = db.session.get(Game, add_game.game_id)

            if not game:
                return jsonify({"msg": "Game not found", "success": False}), 404

            for key, value in data.items():
                setattr(game, key, value)

    db.session.commit()
    return jsonify({"msg": f'Submission {body["status"]}', "success": True, "submission": add_game.serialize()}), 200

@api.route('/admin/users/<int:user_id>/ban', methods=['PUT'])
@jwt_required()
def change_user_ban(user_id):

    current_admin_id = get_jwt_identity()

    admin = db.session.get(User, current_admin_id)
    if not admin or not admin.is_admin:
        return jsonify({"msg": "Admin access required", "success": False}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"msg": "User not found", "success": False}), 404

    body = request.get_json()
    if body is None or "is_active" not in body:
        return jsonify({"msg": "is_active is required", "success": False}), 400

    # UNBAN
    if body["is_active"] == True:

        user.is_active = True

        db.session.commit()
        return jsonify({"msg": "User unbanned", "success": True}), 200

    # BAN
    if "reason" not in body:
        return jsonify({"msg": "Reason is required", "success": False}), 400

    ban = Ban(
        user_id=user_id,
        admin_id=current_admin_id,
        reason=body["reason"],
        ends=body.get("ends")
    )

    user.is_active = False

    db.session.add(ban)
    db.session.commit()
    return jsonify({"msg": "User banned", "success": True, "ban": ban.serialize()}), 200

# ====================== IMPORTAR JUEGOS DESDE IGDB ======================

@api.route('/admin/import-games', methods=['POST'])
@jwt_required()
def import_games_from_igdb():

    if not admin_required():
        return jsonify({"msg": "Admin access required", "success": False}), 403

    body = request.get_json(silent=True) or {}
    query = body.get('query')
    quantity = body.get('quantity', 10)

    if not query:
        return jsonify({"msg": "Query is required", "success": False}), 400

    results = search_igdb_games(query, page_size=quantity)

    if not results:
        return jsonify({"msg": "No se encontraron juegos en IGDB", "success": False}), 404

    imported = []
    skipped = []

    for game_data in results:
        game = create_game_from_igdb(game_data)
        if game:
            imported.append(game.title)
        else:
            skipped.append(game_data.get('name', 'unknown'))

    return jsonify({
        "success": True,
        "message": f"Se importaron {len(imported)} juegos",
        "imported_games": imported,
        "skipped_games": skipped,
    }), 200