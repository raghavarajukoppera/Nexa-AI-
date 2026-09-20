from sqlalchemy import text

from app.database.connection import engine


try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))

        print("SUCCESS: PostgreSQL connected!")
        print(result.fetchone()[0])

except Exception as e:
    print("ERROR: PostgreSQL connection failed")
    print(e)