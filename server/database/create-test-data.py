from . import api as db_api
from .api import models, schemas
from . import dummyData


def create_test_data():
    with db_api.session_scope() as db:
        for user in dummyData.users:
            user = db_api.create_user(db, user)
            print("created test user:\n    ", schemas.User.from_orm(user))
        print()

        for project in dummyData.projects:
            project = db_api.create(db, models.Project, project)
            print("created test project:\n    ", schemas.Project.from_orm(project))
        print()

create_test_data()
