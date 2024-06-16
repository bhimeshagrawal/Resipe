<p  align="center">
 <img src="https://github.com/permitio/opal/assets/4082578/4e21f85f-30ab-43e2-92de-b82f78888c71" height=170 alt="opal" border="0" />
</p>
<h2 align="center">
OPAL Fetcher for MySQL
</h2>

[Check out OPAL main repo here.](https://github.com/permitio/opal)

### What's in this repo?

An OPAL [custom fetch provider](https://docs.opal.ac/tutorials/write_your_own_fetch_provider) to bring authorization state from [MySQL](https://dev.mysql.com/).

This fetcher is both:

- **A fully functional fetch-provider for Postgres:** can be used by OPAL to fetch data from MySQL DB.
- **Serving as an example** how to write custom fetch providers for OPAL and how to publish them as pip packages.

### How to try this custom fetcher in one command? (Example docker-compose configuration)

You can test this fetcher with the example docker compose file in this repository root. Clone this repo, `cd` into the cloned repo, and then run:

```
docker compose up
```

this docker compose configuration already correctly configures OPAL to load the Postgres Fetch Provider, and correctly configures `OPAL_DATA_CONFIG_SOURCES` to include an entry that uses this fetcher.

### ✏️ How to use this fetcher in your OPAL Setup

#### 1) Build a custom opal-client `Dockerfile`

The official docker image only contains the built-in fetch providers. You need to create your own `Dockerfile` (that is based on the official docker image), that includes this fetcher's pip package.

Your `Dockerfile` should look like this:

```
FROM permitio/opal-client:latest
WORKDIR /app/
COPY . ./
RUN python setup.py install --user
```

#### 2) Build your custom opal-client container

Say your special Dockerfile from step one is called `custom_client.Dockerfile`.

You must build a customized OPAL container from this Dockerfile, like so:

```
docker build -t yourcompany/opal-client -f custom_client.Dockerfile .
```

#### 3) When running OPAL, set `OPAL_FETCH_PROVIDER_MODULES`

Pass the following environment variable to the OPAL client docker container (comma-separated provider modules):

```
OPAL_FETCH_PROVIDER_MODULES=opal_common.fetcher.providers,opal_fetcher_mysql.provider
```

Notice that OPAL receives a list from where to search for fetch providers.
The list in our case includes the built-in providers (`opal_common.fetcher.providers`) and our custom mysql provider.

#### 4) Using the custom provider in your DataSourceEntry objects

Your DataSourceEntry objects (either in `OPAL_DATA_CONFIG_SOURCES` or in dynamic updates sent via the OPAL publish API) can now include this fetcher's config.

Example value of `OPAL_DATA_CONFIG_SOURCES` (formatted nicely, but in env var you should pack this to one-line and no-spaces):

```json
{
  "config": {
    "entries": [
      {
        "url": "mysql://root:mysql@example_db:5432/test?password=mysql",
        "config": {
          "fetcher": "MySQLFetchProvider",
          "query": "SELECT * from country;",
          "connection_params": {
            "host": "example_db",
            "port": "3306",
            "db": "test",
            "user": "root",
            "password": "mysql"
          }
        },
        "topics": ["mysql"],
        "dst_path": "countries"
      }
    ]
  }
}
```

Notice how `config` is an instance of `MySQLFetcherConfig` (code is in `opal_fetcher_mysql/provider.py`).

Values for this fetcher config:

- The `url` is actually a mysql dsn. You can set the mysql password in the dsn itself if you want however this implementation uses `connection_params` so you must include them.
- Your `config` must include the `fetcher` key to indicate to OPAL that you use a custom fetcher.
- Your `config` must include the `query` key to indicate what query to run against mysql.

### 🚩 Possible User Issues

While trying to send requests to a Postgres data source, you may encounter that the request fails. This can be caused by the format of the config entry URL for which the standard is:

`mysql://<user>:<password>@<host>/<db>`

It might be most common that this request fails due to the password field being incorrectly parsed by the underlying library called `aiomysql`, which is one of the required libraries used within our OPAL custom data fetcher.

In order to solve the issue, you need to change the data source config entry URL to the format shown below:

`mysql://<host>/<db>?user=<user>&password=<password>`

### 📖 About OPAL (Open Policy Administration Layer)

[OPAL](https://github.com/permitio/opal) is an administration layer for Open Policy Agent (OPA), detecting changes to both policy and policy data in realtime and pushing live updates to your agents.

OPAL brings open-policy up to the speed needed by live applications. As your application state changes (whether it's via your APIs, DBs, git, S3 or 3rd-party SaaS services), OPAL will make sure your services are always in sync with the authorization data and policy they need (and only those they need).

Check out OPAL's main site at [OPAL.ac](https://opal.ac).

<img src="https://i.ibb.co/CvmX8rR/simplified-diagram-highlight.png" alt="simplified" border="0">
