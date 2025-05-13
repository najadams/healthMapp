#!/bin/bash

# Setup script for healthMapp application

echo "Setting up healthMapp application..."

# Clone the repository
echo "Cloning repository from GitHub..."
git clone https://github.com/najadams/healthMapp.git
cd healthMapp

# Create and activate virtual environment for Rasa backend
echo "Setting up Rasa environment..."
python3 -m venv rasa_env
source rasa_env/bin/activate

# Install Rasa and required packages
echo "Installing Rasa and required packages..."
pip install rasa==3.6.21
pip install rasa-sdk==3.6.2
pip install tensorflow-macos==2.12.0  # For macOS
pip install numpy==1.23.5
pip install scikit-learn==1.1.3
pip install matplotlib==3.5.3
pip install pydot==1.4.2
pip install pymongo==4.3.3
pip install python-socketio==5.13.0
pip install python-engineio==4.12.0
pip install sanic==21.12.2
pip install sanic-cors==2.0.1
pip install sanic-jwt==1.8.0
pip install requests==2.32.3
pip install coloredlogs==15.0.1
pip install aiohttp==3.9.5
pip install pyyaml==6.0.2
pip install questionary==1.10.0
pip install redis==4.6.0
pip install SQLAlchemy==1.4.54
pip install structlog==23.3.0

# Additional packages from the list
pip install absl-py==1.4.0 aio-pika==8.2.3 aiofiles==24.1.0 aiogram==2.15 aiohttp-retry==2.9.1 aiormq==6.4.2 aiosignal==1.3.2 APScheduler==3.9.1.post1 astunparse==1.6.3 async-timeout==4.0.3 attrs==22.1.0 babel==2.17.0 bidict==0.23.1 boto3==1.38.13 botocore==1.38.13 CacheControl==0.12.14 cachetools==5.5.2 certifi==2025.4.26 cffi==1.17.1 charset-normalizer==3.4.2 click==8.1.8 cloudpickle==3.1.1 colorclass==2.2.2 colorhash==1.2.1 confluent-kafka==2.10.0 cryptography==44.0.3 cycler==0.12.1 dask==2022.10.2 dnspython==2.3.0 docopt==0.6.2 fbmessenger==6.0.0 filelock==3.18.0 fire==0.7.0 flatbuffers==25.2.10 fonttools==4.57.0 frozenlist==1.6.0 fsspec==2025.3.2 future==1.0.0 gast==0.4.0 google-auth==2.40.1 google-auth-oauthlib==1.0.0 google-pasta==0.2.0 grpcio==1.71.0 h11==0.16.0 h5py==3.13.0 hf-xet==1.1.0 httptools==0.6.4 huggingface-hub==0.31.1 humanfriendly==10.0 idna==3.10 jax==0.4.30 jaxlib==0.4.30 jmespath==1.0.1 joblib==1.5.0 jsonpickle==3.0.4 jsonschema==4.17.3 keras==2.12.0 kiwisolver==1.4.8 libclang==18.1.1 locket==1.0.0 Markdown==3.8 MarkupSafe==3.0.2 mattermostwrapper==2.2 ml_dtypes==0.5.1 msgpack==1.1.0 multidict==5.2.0 networkx==2.6.3 oauthlib==3.2.2 opt_einsum==3.4.0 packaging==20.9 pamqp==3.2.1 partd==1.4.2 pillow==11.2.1 pluggy==1.5.0 portalocker==2.10.1 prompt-toolkit==3.0.28 propcache==0.3.1 protobuf==4.23.3 psycopg2-binary==2.9.10 pyasn1==0.6.1 pyasn1_modules==0.4.2 pycparser==2.22 pydantic==1.10.9 PyJWT==2.10.1 pykwalify==1.8.0 pyparsing==3.2.3 pyrsistent==0.20.0 python-crfsuite==0.9.11 python-dateutil==2.8.2 pytz==2022.7.1 randomname==0.1.5 regex==2022.10.31 requests-oauthlib==2.0.0 requests-toolbelt==1.0.0 rocketchat-API==1.30.0 rsa==4.9.1 ruamel.yaml==0.17.21 ruamel.yaml.clib==0.2.12 s3transfer==0.12.0 safetensors==0.4.5 Sanic-Cors==2.0.1 sanic-routing==0.7.2 scipy==1.10.1 sentry-sdk==1.14.0 simple-websocket==1.1.0 six==1.17.0 sklearn-crfsuite==0.3.6 skops==0.9.0 slack_sdk==3.35.0 structlog-sentry==2.1.0 tabulate==0.9.0 tarsafe==0.0.4 tensorboard==2.12.3 tensorboard-data-server==0.7.2 tensorflow-estimator==2.12.0 tensorflow-hub==0.13.0 termcolor==3.1.0 terminaltables==3.1.10 threadpoolctl==3.6.0 toolz==1.0.0 tqdm==4.67.1 twilio==8.2.2 typing_extensions==4.13.2 typing-utils==0.1.0 tzlocal==5.3.1 ujson==5.10.0 urllib3==2.4.0 uvloop==0.21.0 wcwidth==0.2.13 webexteamssdk==1.6.1 websockets==10.4 Werkzeug==3.1.3 wheel==0.45.1 wrapt==1.14.1 wsproto==1.2.0 yarl==1.20.0

# Deactivate virtual environment
deactivate

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend
npm install
# Setup complete
echo "Setup complete! You can now run the application."
echo "To activate the Rasa environment, use: source rasa_env/bin/activate"