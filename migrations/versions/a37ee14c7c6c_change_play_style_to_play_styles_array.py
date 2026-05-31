"""change play style to play styles array

Revision ID: a37ee14c7c6c
Revises: 511ad9224621
Create Date: 2026-05-31 00:56:54.424066

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'a37ee14c7c6c'
down_revision = '511ad9224621'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("user_survey", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "play_styles",
                postgresql.ARRAY(sa.String(length=40)),
                nullable=True
            )
        )

    op.execute("""
        UPDATE user_survey
        SET play_styles = ARRAY[play_style]
        WHERE play_style IS NOT NULL
    """)

    op.execute("""
        UPDATE user_survey
        SET play_styles = ARRAY['casual']
        WHERE play_styles IS NULL
    """)

    with op.batch_alter_table("user_survey", schema=None) as batch_op:
        batch_op.alter_column(
            "play_styles",
            existing_type=postgresql.ARRAY(sa.String(length=40)),
            nullable=False
        )
        batch_op.drop_column("play_style")


def downgrade():
    with op.batch_alter_table("user_survey", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "play_style",
                sa.String(length=20),
                nullable=True
            )
        )

    op.execute("""
        UPDATE user_survey
        SET play_style = play_styles[1]
        WHERE play_styles IS NOT NULL AND array_length(play_styles, 1) > 0
    """)

    op.execute("""
        UPDATE user_survey
        SET play_style = 'casual'
        WHERE play_style IS NULL
    """)

    with op.batch_alter_table("user_survey", schema=None) as batch_op:
        batch_op.alter_column(
            "play_style",
            existing_type=sa.String(length=20),
            nullable=False
        )
        batch_op.drop_column("play_styles")
