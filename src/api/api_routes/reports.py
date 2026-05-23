from flask import request, jsonify
from api.models import db, User, Comment, Report
from api.routes import api
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
 
 
def admin_required():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)
    return current_user and current_user.is_admin
 
 
# POST /report — Cualquier usuario autenticado puede reportar un comment o un user

@api.route('/report', methods=['POST'])
@jwt_required()
def create_report():
    reporter_id = get_jwt_identity()
    body = request.get_json()
 
    if not body or "reason" not in body:
        return jsonify({"msg": "reason is required", "success": False}), 400
 
    has_comment = "comment_id" in body
    has_user = "user_id" in body
 
    if not has_comment and not has_user:
        return jsonify({"msg": "comment_id or user_id is required", "success": False}), 400
 
    if has_comment and has_user:
        return jsonify({"msg": "Report only one: comment_id or user_id", "success": False}), 400
 
    # Validar que el target existe

    if has_comment:
        comment = db.session.get(Comment, body["comment_id"])
        if not comment:
            return jsonify({"msg": "Comment not found", "success": False}), 404
        # No reportar tu propio comentario
        if comment.user_id == int(reporter_id):
            return jsonify({"msg": "You cannot report your own comment", "success": False}), 400
        
        existing_report = db.session.execute(
            select(Report).where(
                Report.reporter_id == reporter_id,
                Report.reported_comment_id == body["comment_id"]
            )
        ).scalar_one_or_none()

        if existing_report:
            return jsonify({"msg": "You already reported this comment", "success": False}), 400
 
        report = Report(
            reporter_id=reporter_id,
            reported_comment_id=body["comment_id"],
            reason=body["reason"]
        )
 
    else:
        user = db.session.get(User, body["user_id"])
        if not user:
            return jsonify({"msg": "User not found", "success": False}), 404
        # No reportarte a ti mismo
        if int(reporter_id) == int(body["user_id"]):
            return jsonify({"msg": "You cannot report yourself", "success": False}), 400
        
        existing_report = db.session.execute(
            select(Report).where(
                Report.reporter_id == reporter_id,
                Report.reported_user_id == body["user_id"]
            )
        ).scalar_one_or_none()

        if existing_report:
            return jsonify({"msg": "You already reported this user", "success": False}), 400
 
        report = Report(
            reporter_id=reporter_id,
            reported_user_id=body["user_id"],
            reason=body["reason"]
        )
 
    db.session.add(report)
    db.session.commit()
    return jsonify({"msg": "Report submitted", "success": True, "report": report.serialize()}), 201
 
 
# GET /admin/reports/comments — Ver comentarios reportados (solo admin)

@api.route('/admin/reports/comments', methods=['GET'])
@jwt_required()
def get_comment_reports():
    if not admin_required():
        return jsonify({"msg": "Admin access required", "success": False}), 403
 
    reports = db.session.execute(
        select(Report).where(
            Report.reported_comment_id != None,
            Report.resolved == False
        )
    ).scalars().all()
 
    return jsonify({"success": True, "reports": [r.serialize() for r in reports]}), 200
 
 
# GET /admin/reports/users — Ver usuarios reportados (solo admin)

@api.route('/admin/reports/users', methods=['GET'])
@jwt_required()
def get_user_reports():
    if not admin_required():
        return jsonify({"msg": "Admin access required", "success": False}), 403
 
    reports = db.session.execute(
        select(Report).where(
            Report.reported_user_id != None,
            Report.resolved == False
        )
    ).scalars().all()
 
    return jsonify({"success": True, "reports": [r.serialize() for r in reports]}), 200
 
 
# PUT /admin/reports/<id>/resolve — Marcar reporte como resuelto

@api.route('/admin/reports/<int:report_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_report(report_id):
    if not admin_required():
        return jsonify({"msg": "Admin access required", "success": False}), 403
 
    report = db.session.get(Report, report_id)
    if not report:
        return jsonify({"msg": "Report not found", "success": False}), 404
 
    report.resolved = True
    db.session.commit()
    return jsonify({"msg": "Report resolved", "success": True}), 200
 
 
# DELETE /admin/reports/<id>/comment — Borrar el comentario reportado y resolver

@api.route('/admin/reports/<int:report_id>/delete-comment', methods=['DELETE'])
@jwt_required()
def delete_reported_comment(report_id):
    if not admin_required():
        return jsonify({"msg": "Admin access required", "success": False}), 403
 
    report = db.session.get(Report, report_id)
    if not report or not report.reported_comment_id:
        return jsonify({"msg": "Report or comment not found", "success": False}), 404
 
    comment = db.session.get(Comment, report.reported_comment_id)
    if comment:
        db.session.delete(comment)  # cascade borra el report también por ondelete
 
    db.session.commit()
    return jsonify({"msg": "Comment deleted and report resolved", "success": True}), 200