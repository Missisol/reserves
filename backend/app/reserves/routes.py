from datetime import date, datetime, timezone
from flask import jsonify, request
from app import db
from app.models import Reserve, ReserveCategory
from app.reserves import bp


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------

@bp.route('/reserve_categories', methods=['GET'])
def get_reserve_categories():
    """Get all reserve categories sorted alphabetically."""
    categories = ReserveCategory.query.order_by(
        ReserveCategory.name.asc()
    ).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
    } for c in categories]), 200


@bp.route('/reserve_categories', methods=['POST'])
def create_reserve_category():
    """Create a new reserve category."""
    data = request.json
    if not data or not data.get('name', '').strip():
        return jsonify({'error': 'Name is required'}), 400

    name = data['name'].strip()
    if ReserveCategory.query.filter_by(name=name).first():
        return jsonify({'error': 'Category with this name already exists'}), 409

    category = ReserveCategory(name=name)
    try:
        db.session.add(category)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    return jsonify({'id': category.id, 'name': category.name}), 201


@bp.route('/reserve_category/<int:id>', methods=['PATCH'])
def manage_reserve_category(id):
    """Update or delete a reserve category.

    - If 'name' is provided: updates the category name
    - If 'action' is 'delete': deletes the category (sets category_id NULL on related reserves)
    """
    category = ReserveCategory.query.get_or_404(id)
    data = request.json

    if not data or ('name' not in data and data.get('action') != 'delete'):
        return jsonify({'error': 'Missing name or action parameter'}), 400

    # Update name
    if 'name' in data and data['name']:
        new_name = data['name'].strip()
        existing = ReserveCategory.query.filter(
            ReserveCategory.name == new_name,
            ReserveCategory.id != id
        ).first()
        if existing:
            return jsonify({'error': 'Category with this name already exists'}), 409
        category.name = new_name

    # Delete
    if data.get('action') == 'delete':
        # Set NULL on related reserves so they are not deleted
        Reserve.query.filter_by(category_id=id).update(
            {'category_id': None}, synchronize_session=False
        )
        db.session.delete(category)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        return '', 204

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify({'id': category.id, 'name': category.name}), 200


# ---------------------------------------------------------------------------
# Reserves
# ---------------------------------------------------------------------------

@bp.route('/reserves', methods=['GET'])
def get_reserves():
    """Get reserves with optional filters, sorting and pagination."""
    status = request.args.get('status', 'all')
    category_id = request.args.get('category_id', type=int)
    sort = request.args.get('sort', 'created_at')
    order = request.args.get('order', 'desc')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Limit per_page to a reasonable maximum
    per_page = min(per_page, 100)

    query = Reserve.query

    # Filter by status
    if status == 'active':
        query = query.filter(Reserve.is_active == True)
    elif status == 'inactive':
        query = query.filter(Reserve.is_active == False)

    # Filter by category
    if category_id:
        query = query.filter(Reserve.category_id == category_id)

    # Sorting
    sort_fields = {
        'kind': Reserve.kind,
        'quantity': Reserve.quantity,
        'created_at': Reserve.created_at,
        'expiry_date': Reserve.expiry_date,
        'location': Reserve.location,
        'place': Reserve.place,
        'category': ReserveCategory.name,
    }
    sort_col = sort_fields.get(sort, Reserve.created_at)
    if sort == 'category':
        query = query.outerjoin(ReserveCategory)
    if order == 'asc':
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # Pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    reserves = pagination.items

    return jsonify({
        'items': [{
            'id': r.id,
            'created_at': r.created_at.isoformat(),
            'category_id': r.category_id,
            'category_name': r.category.name if r.category else '',
            'kind': r.kind,
            'description': r.description,
            'quantity': r.quantity,
            'unit': r.unit,
            'expiry_date': r.expiry_date.isoformat() if r.expiry_date else None,
            'location': r.location,
            'place': r.place,
            'is_active': r.is_active,
        } for r in reserves],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_prev': pagination.has_prev,
            'has_next': pagination.has_next,
        }
    }), 200


@bp.route('/reserve/<int:id>', methods=['GET'])
def get_reserve(id):
    """Get a single reserve by id."""
    reserve = Reserve.query.get_or_404(id)
    return jsonify({
        'id': reserve.id,
        'created_at': reserve.created_at.isoformat(),
        'category_id': reserve.category_id,
        'category_name': reserve.category.name if reserve.category else '',
        'kind': reserve.kind,
        'description': reserve.description,
        'quantity': reserve.quantity,
        'unit': reserve.unit,
        'expiry_date': reserve.expiry_date.isoformat() if reserve.expiry_date else None,
        'location': reserve.location,
        'place': reserve.place,
        'is_active': reserve.is_active,
    }), 200


@bp.route('/reserve', methods=['POST'])
def create_reserve():
    """Create a new reserve."""
    data = request.json
    errors = _validate_reserve(data)
    if errors:
        return jsonify({'error': errors}), 400

    category_id = data.get('category_id')
    reserve = Reserve(
        created_at=datetime.now(timezone.utc),
        category_id=category_id if category_id else None,
        kind=data['kind'],
        description=data.get('description'),
        quantity=_to_float(data['quantity']),
        unit=data.get('unit'),
        expiry_date=_parse_date(data.get('expiry_date')),
        location=data.get('location'),
        place=data.get('place'),
        is_active=data.get('is_active', True),
    )
    try:
        db.session.add(reserve)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    return jsonify({
        'id': reserve.id,
        'created_at': reserve.created_at.isoformat(),
        'category_id': reserve.category_id,
        'kind': reserve.kind,
        'description': reserve.description,
        'quantity': reserve.quantity,
        'unit': reserve.unit,
        'expiry_date': reserve.expiry_date.isoformat() if reserve.expiry_date else None,
        'location': reserve.location,
        'place': reserve.place,
        'is_active': reserve.is_active,
    }), 201


@bp.route('/reserve/<int:id>', methods=['PUT'])
def update_reserve(id):
    """Replace a reserve with the provided data."""
    reserve = Reserve.query.get_or_404(id)
    data = request.json
    errors = _validate_reserve(data)
    if errors:
        return jsonify({'error': errors}), 400

    reserve.category_id = data.get('category_id') if data.get('category_id') else None
    reserve.kind = data['kind']
    reserve.description = data.get('description')
    reserve.quantity = _to_float(data['quantity'])
    reserve.unit = data.get('unit')
    reserve.expiry_date = _parse_date(data.get('expiry_date'))
    reserve.location = data.get('location')
    reserve.place = data.get('place')
    reserve.is_active = data.get('is_active', reserve.is_active)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    return jsonify({
        'id': reserve.id,
        'created_at': reserve.created_at.isoformat(),
        'category_id': reserve.category_id,
        'kind': reserve.kind,
        'description': reserve.description,
        'quantity': reserve.quantity,
        'unit': reserve.unit,
        'expiry_date': reserve.expiry_date.isoformat() if reserve.expiry_date else None,
        'location': reserve.location,
        'place': reserve.place,
        'is_active': reserve.is_active,
    }), 200


@bp.route('/reserve/<int:id>', methods=['PATCH'])
def update_reserve_partial(id):
    """Partially update a reserve (e.g. toggle is_active)."""
    reserve = Reserve.query.get_or_404(id)
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'is_active' in data:
        reserve.is_active = bool(data['is_active'])
    if 'category_id' in data:
        reserve.category_id = data['category_id'] if data['category_id'] else None
    if 'kind' in data:
        reserve.kind = data['kind']
    if 'description' in data:
        reserve.description = data['description']
    if 'quantity' in data:
        reserve.quantity = _to_float(data['quantity'])
    if 'unit' in data:
        reserve.unit = data['unit']
    if 'expiry_date' in data:
        reserve.expiry_date = _parse_date(data.get('expiry_date'))
    if 'location' in data:
        reserve.location = data['location']
    if 'place' in data:
        reserve.place = data['place']

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    return jsonify({
        'id': reserve.id,
        'is_active': reserve.is_active,
    }), 200


@bp.route('/reserve/<int:id>', methods=['DELETE'])
def delete_reserve(id):
    """Delete a reserve."""
    reserve = Reserve.query.get_or_404(id)
    try:
        db.session.delete(reserve)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    return '', 204


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_reserve(data):
    """Return an error string if required fields are missing/invalid."""
    if not data:
        return 'Request body is required'
    if not str(data.get('kind', '')).strip():
        return 'Kind is required'
    quantity = _to_float(data.get('quantity'))
    if quantity is None or quantity <= 0:
        return 'Quantity must be greater than 0'
    return None


def _to_float(value):
    """Convert a value to float or return None."""
    if value is None or value == '':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def _parse_date(value):
    """Parse an ISO date string (YYYY-MM-DD) or return None."""
    if not value:
        return None
    try:
        return date.fromisoformat(str(value))
    except (ValueError, TypeError):
        return None
