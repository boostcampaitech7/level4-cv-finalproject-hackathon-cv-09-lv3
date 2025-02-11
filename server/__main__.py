import click
import uvicorn

from .config import config


@click.command()
@click.option(
    "--port", type=int, default=config.port,
    help="server port",
    show_default=True
)
@click.option(
    "--reload", is_flag=True, default=False,
    help="reload server on code changes",
    hidden=True
)
def main(port, reload):
    config.port = port
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=reload)


main()
