rsync -ravzP ./* --exclude=.git --exclude=.idea --exclude=*.sh --exclude=node_modules features:~/
