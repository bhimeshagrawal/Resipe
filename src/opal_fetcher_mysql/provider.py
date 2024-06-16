from typing import Optional, List

import aiomysql
from pydantic import BaseModel, Field
from tenacity import wait, stop, retry_unless_exception_type

from opal_common.fetcher.fetch_provider import BaseFetchProvider
from opal_common.fetcher.events import FetcherConfig, FetchEvent
from opal_common.logger import logger


# Configurations for the MySQL Connection
class MySQLConnectionParams(BaseModel):
    db: Optional[str] = Field(None, description="the database name")
    user: Optional[str] = Field(None, description="user name used to authenticate")
    password: Optional[str] = Field(None, description="password used to authenticate")
    host: Optional[str] = Field(
        None,
        description="database host address (defaults to UNIX socket if not provided)",
    )
    port: Optional[str] = Field(
        None, description="connection port number (defaults to 3306 if not provided)"
    )

# Configuration for the MySQL Fetcher
class MySQLFetcherConfig(FetcherConfig):
    fetcher: str = "MySQLFetchProvider"
    connection_params: Optional[MySQLConnectionParams] = Field(
        None,
        description="these params can override or complement parts of the dsn (connection string)",
    )
    query: str = Field(
        ..., description="the query to run against mysql in order to fetch the data"
    )
    fetch_one: bool = Field(
        False,
        description="whether we fetch only one row from the results of the SELECT query",
    )


class MySQLFetchEvent(FetchEvent):
    fetcher: str = "MySQLFetchProvider"
    config: MySQLFetcherConfig = None


class MySQLFetchProvider(BaseFetchProvider):

    RETRY_CONFIG = {
        "wait": wait.wait_random_exponential(),
        "stop": stop.stop_after_attempt(10),
        "retry": retry_unless_exception_type(
            aiomysql.DatabaseError
        ),  # query error (i.e: invalid table, etc)
        "reraise": True,
    }
    
    def __init__(self, event: MySQLFetchEvent) -> None:
        if event.config is None:
            event.config = MySQLFetcherConfig()
        super().__init__(event)
        self._connection: Optional[aiomysql.Connection] = None

    def parse_event(self, event: FetchEvent) -> MySQLFetchEvent:
        return MySQLFetchEvent(**event.dict(exclude={"config"}), config=event.config)

    async def __aenter__(self):
        self._event: MySQLFetchEvent

        connection_params: dict = (
            {}
            if self._event.config.connection_params is None
            else self._event.config.connection_params.dict(exclude_none=True)
        )

        # connect to the mysql database
        try:
            logger.debug(f"Connecting to database")
            self._connection: aiomysql.Connection = await aiomysql.connect(
                host=connection_params.get("host"),
                port=int(connection_params.get("port")),
                user=connection_params.get("user"),
                password=connection_params.get("password"),
                db=connection_params.get("db"),
            )
            logger.debug(f"Connected to database")
            return self
        except Exception as e:
            logger.error(f"{connection_params}")
            logger.error(f"Error connecting to database: {e}")
            raise

    async def __aexit__(self, exc_type=None, exc_val=None, tb=None):
        try:
            if self._connection is not None:
                self._connection.close()
                logger.debug("Connection to database closed")
        except Exception as e:
            logger.error(f"Error closing database connection: {e}")

    async def _fetch_(self):
        self._event: MySQLFetchEvent

        if self._event.config is None:
            logger.warning(
                "incomplete fetcher config: mysql data entries require a query to specify what data to fetch!"
            )
            return

        logger.debug(f"{self.__class__.__name__} fetching from {self._url}")

        try:
            async with self._connection.cursor(aiomysql.DictCursor) as cursor:
                row = await cursor.execute(self._event.config.query)
                if self._event.config.fetch_one:
                    return [row] if row is not None else []
                else:
                    records = await cursor.fetchall()
                    logger.debug(f"Fetched data: {records}")
                    return records
        except Exception as e:
            logger.error(f"Error fetching data from database: {e}")
            raise