from sqlalchemy import Column, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base


class Row(Base):
    __tablename__ = "rows"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    raw_json = Column(JSON, nullable=False)

    file = relationship("File", back_populates="rows")
