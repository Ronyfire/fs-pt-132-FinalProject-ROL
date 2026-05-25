"""add updated_at to user game tier

Revision ID: 5c51033f1f61
Revises: abb66940316a
Create Date: 2026-XX-XX
"""

from alembic import op
import sqlalchemy as sa


revision = "5c51033f1f61"
down_revision = "abb66940316a"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("user_game_tier", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=True
            )
        )
        batch_op.add_column(
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=True
            )
        )

    op.execute(
        """
        UPDATE user_game_tier
        SET created_at = NOW()
        WHERE created_at IS NULL
        """
    )

    op.execute(
        """
        UPDATE user_game_tier
        SET updated_at = NOW()
        WHERE updated_at IS NULL
        """
    )

    with op.batch_alter_table("user_game_tier", schema=None) as batch_op:
        batch_op.alter_column(
            "created_at",
            existing_type=sa.DateTime(timezone=True),
            nullable=False
        )
        batch_op.alter_column(
            "updated_at",
            existing_type=sa.DateTime(timezone=True),
            nullable=False
        )


def downgrade():
    with op.batch_alter_table("user_game_tier", schema=None) as batch_op:
        batch_op.drop_column("updated_at")
        batch_op.drop_column("created_at")