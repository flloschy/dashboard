mkdir output

cd page
npm run build
cd ..
mv ./page/dist/index.html output/dashboard.html

cd server
echo "still need to figure out how to do that stuff"
