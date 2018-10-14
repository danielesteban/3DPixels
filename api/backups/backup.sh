#!/bin/bash
BACKUP=`date +%Y%m%d-%H%M`.tar.gz
rm -rf /data/dump
mongodump -o /data/dump -d 3dpixels
tar -C /data/dump -czf /data/backups/${BACKUP} 3dpixels
rm -rf /data/dump
rm -f /data/backups/latest.tar.gz
ln -s /data/backups/${BACKUP} /data/backups/latest.tar.gz
