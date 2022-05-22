#!/usr/bin/env bash

if [[ "$1" != "eula-accept" ]]; then
  cat << EulaMessage
+-------------------------------------------------------------+
|                          ERROR!                             |
| It seems you did not accept the End User License Agreement. |
|  By running the following line, you agree that you have     |
|    read and accepted the End User License Agreement at      |
|          http://flogo.io/flogo-docker_eula.pdf :            |
|                                                             |
| docker run -it -p 3303:3303 flogo/flogo-web eula-accept  |
|                                                             |
+-------------------------------------------------------------+
EulaMessage
  cd /flogo-web/flogo-eula && npm run start 2>&1 >/dev/null
  exit 0
fi

flow-store > local/logs/flow-store 2>&1 &
echo "started flow store service (pid: $!)"

cd apps/server
node main.js
