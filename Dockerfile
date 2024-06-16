FROM permitio/opal-client:latest
WORKDIR /app/
COPY . ./
RUN python setup.py install --user
