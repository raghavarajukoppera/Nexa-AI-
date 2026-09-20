from sqlalchemy import text

from app.database.connection import engine


print("Checking users table...")

with engine.begin() as connection:
    result = connection.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name = 'password_hash'
            """
        )
    )

    column_exists = result.fetchone()

    if column_exists:
        print("password_hash column already exists.")
    else:
        connection.execute(
            text(
                """
                ALTER TABLE users
                ADD COLUMN password_hash VARCHAR(255)
                """
            )
        )

        print("password_hash column added successfully.")

print("Database update completed.")