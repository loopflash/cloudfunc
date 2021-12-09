mkdir ./docs/markdown2

for FILE in ./docs/markdown/*; do
    sed 's/<!-- -->//g' $FILE > ./docs/markdown2/$(basename $FILE)
done

rm -rf ./docs/markdown

cp -fr ./docs/markdown2 ./docs/markdown

rm -rf ./docs/markdown2
