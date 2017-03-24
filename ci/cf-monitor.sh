#!/bin/bash -e

REPO_ROOT=$(git rev-parse --show-toplevel)

if [ ! -d "$REPO_ROOT" ]; then
  echo "Could not find repo root, set correct path in script"
  exit 1
fi

APP_DIR=$REPO_ROOT/src/app
SCRIPT_DIR=$REPO_ROOT/src/scripts

if [ ! -d "$APP_DIR" ]; then
  echo "Could not find app dir, set correct path in script"
  exit 1
fi

if [ ! -d "$SCRIPT_DIR" ]; then
  echo "Could not find script dir, set correct path in script"
  exit 1
fi

tmux new-session -d -n "Static" -c "$APP_DIR/Mgmt" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs Mgmt")'
tmux split-window -h -c "$APP_DIR/LogRepo" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs LogRepo")'
tmux split-window -v -c "$APP_DIR/ArtifactRepo" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs ArtifactRepo")'
tmux split-window -h -c "$APP_DIR/UserRepo" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs UserRepo")'
tmux split-window -v -c "$APP_DIR/CodeRepo" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs CodeRepo")'
tmux split-window -h -c "$APP_DIR/MetaData" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs MetaData")'
#tmux split-window -h -c "$SCRIPT_DIR/" 'bash --rcfile <(echo ". ~/.bashrc; docker-compose up mongo rabbitmq")'
tmux select-layout -t "Static" tiled

tmux new-window -n "Dynamic" -c "$APP_DIR/Exec" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs Exec")'
tmux split-window -v -c "$APP_DIR/BaselineGen" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs BaselineGen")'
tmux split-window -h -c "$APP_DIR/FlowCtrl" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs FlowCtrl")'
tmux split-window -v -c "$APP_DIR/DataResolve" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs DataResolve")'
tmux split-window -h -c "$APP_DIR/UI" 'bash --rcfile <(echo ". ~/.bashrc; pm2 logs UI")'
tmux split-window -v -c "$APP_DIR/" 'bash'
tmux select-layout -t "Dynamic" tiled

tmux new-window -n "Debug" -c "$APP_DIR" 'mongo'
tmux split-window -v -c "$REPO_ROOT/" 'bash'
tmux split-window -v -c "$REPO_ROOT/" 'bash'
tmux select-layout -t "Debug" tiled
tmux -2 attach
