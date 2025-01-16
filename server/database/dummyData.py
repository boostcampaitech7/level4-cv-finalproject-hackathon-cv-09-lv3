from datetime import datetime
from .api import schemas

users = (
    schemas.UserCreate(
        name="Aespa",
        email="test@aespa.com",
        password="1234",
        created=datetime(2024, 10, 1, 10, 3),
    ),
     schemas.UserCreate(
        name="SuperNova",
        email="test@supernova.com",
        password="1234",
        created=datetime(2024, 10, 1, 10, 3),
    )
)


projects = (
    schemas.ProjectCreate(
        name="trip_1",
        size=10000000,
        modified=datetime(2024, 1, 1, 10, 45),
        owner = 'SuperNova',
        owner_id=2,
        created=datetime(2024, 10, 1, 10, 3),
    ),
    schemas.ProjectCreate(
        name="trip_2",
        size=54000000,
        modified=datetime(2024, 1, 1, 8, 10),
        owner = 'Aespa',
        owner_id=1,
        created=datetime(2024, 10, 1, 10, 3),
    ),
)
