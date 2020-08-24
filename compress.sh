#/bin/sh

# npm install uglify-js -g

LIST=`cat index.html | grep script | awk -F '"' '{ print $2 }'`
LISTCSS=`cat index.html | grep stylesheet | awk -F '"' '{ print $4}'`


uglifyjs $LIST --compress --mangle -o aiesigner.js 

cat index.html | grep -v "script src" | grep -v "stylesheet" | grep -v "</body></html>" > index.min.html

echo "<style>" >> index.min.html
cat $LISTCSS >> index.min.html
echo "</style>" >> index.min.html

echo "<script>" >> index.min.html
cat aiesigner.js >> index.min.html
echo "</script>" >> index.min.html
echo "</body></html>" >> index.min.html

rm -f aiesigner.js

sha256sum index.min.html > sha256.md
