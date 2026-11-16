from datetime import date, datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, select
import sqlalchemy.orm as so

from app import db

class ReserveCategory(db.Model):
    __tablename__ = 'reserve_category'

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(
        String(100), unique=True, index=True
    )

    # Удаление категории не удаляет запасы: FK с ondelete='SET NULL'
    # обнуляет category_id на уровне базы данных.
    reserves: so.Mapped[list['Reserve']] = so.relationship(
        back_populates='category', passive_deletes=True
    )

    def __repr__(self):
        return f'<ReserveCategory {self.name}>'


class Reserve(db.Model):
    __tablename__ = 'reserve'

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    created_at: so.Mapped[datetime] = so.mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True
    )
    category_id: so.Mapped[Optional[int]] = so.mapped_column(
        ForeignKey('reserve_category.id', ondelete='SET NULL'),
        index=True,
        default=None,
    )
    kind: so.Mapped[str] = so.mapped_column(
        String(100), index=True
    )
    description: so.Mapped[Optional[str]] = so.mapped_column(
        Text, default=None
    )
    quantity: so.Mapped[float] = so.mapped_column(Float)
    unit: so.Mapped[Optional[str]] = so.mapped_column(
        String(20), default=None
    )
    expiry_date: so.Mapped[Optional[date]] = so.mapped_column(
        Date, index=True, default=None
    )
    location: so.Mapped[Optional[str]] = so.mapped_column(
        String(200), default=None
    )
    place: so.Mapped[Optional[str]] = so.mapped_column(
        String(200), default=None
    )
    is_active: so.Mapped[bool] = so.mapped_column(
        Boolean, default=True, index=True
    )

    category: so.Mapped['ReserveCategory'] = so.relationship(
        back_populates='reserves'
    )

    def __repr__(self):
        return f'<Reserve {self.kind}>'
