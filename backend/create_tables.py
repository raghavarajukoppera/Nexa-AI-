from app.database.connection import Base, engine

# Import models so SQLAlchemy registers them with Base
from app.models import User, Resume, ResumeAnalysis


print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")