from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt, verify_jwt_in_request
import psycopg2
from psycopg2.extras import RealDictCursor
from configBackend import db_params

# READ-ONLY endpoints — NLDC must be allowed here
READ_ONLY_ENDPOINT_KEYWORDS = [
    "fetch", "view", "get", "list",
    "mape", "status", "revision", "revisions",
    "weekahead", "monthahead", "yearahead"
]

def is_read_only(path: str) -> bool:
    """Detects read-only endpoints based on URL path."""
    path = path.lower()
    return any(key in path for key in READ_ONLY_ENDPOINT_KEYWORDS)


def role_required(allowed_roles=None, enforce_state=False):
    if allowed_roles is None:
        allowed_roles = []

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                jwt_data = get_jwt()

                username = jwt_data.get("sub")
                user_role = (jwt_data.get("role") or "").lower()
                request_path = (request.path or "").lower()

                # Detect if this is a read-only endpoint
                read_only = is_read_only(request_path)

                # For non-admin users → fetch their state_id
                user_state_id = None
                if user_role != "admin":
                    conn = psycopg2.connect(**db_params)
                    cursor = conn.cursor(cursor_factory=RealDictCursor)
                    cursor.execute(
                        "SELECT state_id FROM states WHERE username=%s",
                        (username,)
                    )
                    row = cursor.fetchone()
                    cursor.close()
                    conn.close()
                    user_state_id = str(row["state_id"]) if row else None

                # -----------------------------
                # READ-ONLY ACCESS RULE
                # -----------------------------
                if read_only:
                    # If route explicitly restricts roles → enforce
                    if allowed_roles:
                        if user_role not in [r.lower() for r in allowed_roles]:
                            return jsonify({"status": "failure",
                                            "message": "Access Denied: Invalid role"}), 403
                    else:
                        # Default read-only access for these roles:
                        if user_role not in ("admin", "user", "nldc"):
                            return jsonify({"status": "failure",
                                            "message": "Access Denied: Invalid role"}), 403

                    # No state enforcement on read-only endpoints
                    return fn(*args, **kwargs)

                # -----------------------------
                # WRITE (UPLOAD) ACCESS RULE
                # -----------------------------

                # Role restriction for upload routes
                if allowed_roles and user_role not in [r.lower() for r in allowed_roles]:
                    return jsonify({"status": "failure",
                                    "message": "Access Denied: Invalid role"}), 403

                # State enforcement for upload writes
                if enforce_state and user_role != "admin":
                    req_json = request.get_json(silent=True) or {}

                    req_state = None
                    if "params" in req_json:
                        req_state = req_json["params"].get("state")
                    else:
                        req_state = req_json.get("state")

                    if req_state and str(req_state) != user_state_id:
                        return jsonify({"status": "failure",
                                        "message": "Access Denied: Wrong state"}), 403

                return fn(*args, **kwargs)

            except Exception as e:
                return jsonify({
                    "status": "failure",
                    "message": f"Access check failed: {str(e)}"
                }), 403

        return wrapper
    return decorator



def permission_required(permission_key: str, enforce_state=False):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                jwt_data = get_jwt()

                username = jwt_data.get("sub")
                user_role = jwt_data.get("role")
                request_path = request.path.lower()

                # Fetch user permissions
                conn = psycopg2.connect(**db_params)
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                cursor.execute("""
                    SELECT p.permission_key 
                    FROM user_permissions up
                    JOIN permissions_master p ON p.permission_id = up.permission_id
                    WHERE up.username = %s
                """, (username,))
                
                user_permissions = {row["permission_key"] for row in cursor.fetchall()}
                cursor.close()
                conn.close()

                # Permission check
                if permission_key not in user_permissions:
                    return jsonify({
                        "status": "failure",
                        "message": f"Access Denied: Missing permission '{permission_key}'"
                    }), 403

                # Enforce state-based access only for upload
                if enforce_state and user_role != "admin":
                    req_json = request.get_json(silent=True) or {}
                    req_state = req_json.get("state") or req_json.get("params", {}).get("state")

                    conn = psycopg2.connect(**db_params)
                    cursor = conn.cursor()
                    cursor.execute("SELECT state_id FROM states WHERE username=%s", (username,))
                    user_state_id = cursor.fetchone()[0]
                    cursor.close()
                    conn.close()

                    if str(req_state) != str(user_state_id):
                        return jsonify({
                            "status": "failure",
                            "message": "Access Denied: Wrong state"
                        }), 403

                return fn(*args, **kwargs)

            except Exception as e:
                return jsonify({
                    "status": "failure",
                    "message": f"Access check failed: {str(e)}"
                }), 403
        return wrapper
    return decorator



def has_permission(role_name, endpoint):
    conn = psycopg2.connect(**db_params)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT permission_key FROM endpoint_permissions WHERE endpoint = %s",
                (endpoint,))
    row = cur.fetchone()
    if not row:
        return False

    permission_key = row["permission_key"]

    cur.execute("SELECT permission_id FROM permissions_master WHERE permission_key = %s",
                (permission_key,))
    perm = cur.fetchone()
    if not perm:
        return False

    permission_id = perm["permission_id"]

    cur.execute("""
        SELECT 1
        FROM roles r
        JOIN role_permissions rp ON rp.role_id = r.role_id
        WHERE lower(r.role_name) = lower(%s) AND rp.permission_id = %s
    """, (role_name, permission_id))

    ok = cur.fetchone()
    cur.close()
    conn.close()
    return ok is not None


def rbac_required(permission_key=None, enforce_state=False):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):

            # Skip RBAC for CORS preflight
            if request.method == "OPTIONS":
                return fn(*args, **kwargs)

            verify_jwt_in_request()
            jwt_data = get_jwt()

            # User injected by session_token_required
            user = getattr(request, "user", None)
            if not user:
                return jsonify({
                    "status": "failure",
                    "message": "User context missing"
                }), 401

            role = (user.get("role") or "").lower()
            permissions = [p.lower() for p in (user.get("permissions") or [])]
            user_state = str(user.get("state_id"))

            # 1️⃣ Admin full access
            if role == "admin":
                return fn(*args, **kwargs)

            # 2️⃣ Permission check
            if permission_key and permission_key.lower() not in permissions:
                return jsonify({
                    "status": "failure",
                    "message": "Permission denied"
                }), 403

            # 3️⃣ State enforcement (f_user / t_user)
            if enforce_state and role not in ("admin", "nldc"):

                body = request.get_json(silent=True) or {}
                print("Request Body:", body)

                # FIXED: read from body.params.state also
                requested_state = (
                    body.get("state") or
                    (body.get("params", {}) or {}).get("state") or
                    request.args.get("state") or
                    request.form.get("state")
                )

                print("Requested State:", requested_state, "User State:", user_state)

                # If frontend did not send state → auto assign logged-in user's state
                if requested_state is None:
                    requested_state = user_state

                if str(requested_state) != user_state:
                    return jsonify({
                        "status": "failure",
                        "message": "Wrong state"
                    }), 403

            return fn(*args, **kwargs)

        return wrapper
    return decorator
