git checkout master
git checkout origin/master .
git pull -r
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d --scale worker=10
