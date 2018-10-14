#!/bin/bash
BACKUP="latest"
if [ -n "$1" ]; then
  BACKUP=$1
fi
rm -rf /data/dump
mkdir -p /data/dump
tar -C /data/dump -xzf /data/backups/${BACKUP}.tar.gz
mongo dbpixels --eval "db.dropDatabase()"
mongorestore /data/dump
rm -rf /data/dump
