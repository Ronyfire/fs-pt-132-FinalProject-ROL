from flask import request, jsonify
from api.models import db, User, Game, Comment, Report
from api.routes import api
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select


# GET game comments
@api.route('/games/<int:game_id>/comments', methods=['GET'])
def get_game_comments(game_id):

    game = db.session.get(Game, game_id)

    if not game:
        return jsonify({"msg": "Game not found", "success": False}), 404

    comments = db.session.execute(
        select(Comment).where(
            Comment.game_id == game_id
        )
    ).scalars().all()

    return jsonify({"success": True, "comments": [comment.serialize() for comment in comments]}), 200


# POST create comment / reply
@api.route('/games/<int:game_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(game_id):

    current_user_id = get_jwt_identity()

    game = db.session.get(Game, game_id)

    if not game:
        return jsonify({"msg": "Game not found", "success": False}), 404

    body = request.get_json()

    if not body or "content" not in body:
        return jsonify({"msg": "Content is required", "success": False}), 400

    parent_comment_id = body.get("parent_id")

    if parent_comment_id:

        parent_comment = db.session.get(Comment, parent_comment_id)

        if not parent_comment:
            return jsonify({"msg": "Parent comment not found", "success": False}), 404

        if parent_comment.game_id != game_id:
            return jsonify({"msg": "Parent comment belongs to another game", "success": False}), 400

    comment = Comment(
        user_id=current_user_id,
        game_id=game_id,
        content=body["content"],
        parent_id=parent_comment_id
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify({"msg": "Comment created", "success": True, "comment": comment.serialize()}), 201

# PUT update comment
@api.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):

    current_user_id = get_jwt_identity()

    comment = db.session.get(Comment, comment_id)

    if not comment:
        return jsonify({"msg": "Comment not found", "success": False}), 404

    if comment.user_id != int(current_user_id):
        return jsonify({"msg": "Not authorized", "success": False}), 403

    body = request.get_json()

    if not body or "content" not in body:
        return jsonify({"msg": "Content is required", "success": False}), 400

    comment.content = body["content"]

    db.session.commit()

    return jsonify({"msg": "Comment updated", "success": True, "comment": comment.serialize()}), 200

# DELETE comment
@api.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):

    current_user_id = get_jwt_identity()

    current_user = db.session.get(User, current_user_id)
    comment = db.session.get(Comment, comment_id)

    if not comment:
        return jsonify({"msg": "Comment not found", "success": False}), 404

    if (
        comment.user_id != int(current_user_id)
        and not current_user.is_admin
    ):
        return jsonify({"msg": "Not authorized", "success": False}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"msg": "Comment deleted", "success": True}), 200

@api.route('/comments/<int:comment_id>/report', methods=['POST'])
@jwt_required()
def report_comment(comment_id):
    current_user_id = get_jwt_identity()

    comment = db.session.get(Comment, comment_id)

    if not comment:
        return jsonify({"msg": "Comment not found", "success": False}), 404

    if comment.user_id == int(current_user_id):
        return jsonify({"msg": "You cannot report your own comment", "success": False}), 400

    body = request.get_json()

    if not body or "reason" not in body:
        return jsonify({"msg": "Reason is required", "success": False}), 400

    existing_report = db.session.execute(
        select(Report).where(
            Report.reporter_id == current_user_id,
            Report.reported_comment_id == comment_id
        )
    ).scalar_one_or_none()

    if existing_report:
        return jsonify({"msg": "You already reported this comment", "success": False}), 400

    report = Report(
        reporter_id=current_user_id,
        reported_comment_id=comment_id,
        reported_user_id=comment.user_id,
        reason=body["reason"]
    )

    db.session.add(report)
    db.session.commit()

    return jsonify({
        "msg": "Comment reported",
        "success": True,
        "report": report.serialize()
    }), 201


@api.route('/admin/reports', methods=['GET'])
@jwt_required()
def get_reports():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"msg": "Admin access required", "success": False}), 403

    reports = db.session.execute(
        select(Report).where(Report.resolved == False)
    ).scalars().all()

    return jsonify({"success": True, "reports": [report.serialize() for report in reports]}), 200


@api.route('/admin/reports/<int:report_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_report(report_id):
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"msg": "Admin access required", "success": False}), 403

    report = db.session.get(Report, report_id)

    if not report:
        return jsonify({"msg": "Report not found", "success": False}), 404

    report.resolved = True

    db.session.commit()

    return jsonify({"msg": "Report resolved", "success": True, "report": report.serialize()}), 200