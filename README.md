# Poc_LLM_CB_FIWARE

## Deployment 

### Download the desired map
Download and copy the desired `.mbtiles` in the `./src/map` folder


1. [Madrid Map](https://drive.upm.es/s/17y49EZQJm90m1J) 
2. [Naples Map](https://drive.upm.es/s/ntikqYe2zqudukx)


### Serve the map

```
cd src/map
docker run -it -v $(pwd):/data -p 8080:8080 maptiler/tileserver-gl:v4.6.6 --verbose
``` 
You can access localhost:8080 to see if the map was loaded correctly


### Configure API OPEN-AI
```
cd src
cp template.env .env
# modify OPENAI_API_KEY with your OPENAI_API_KEY 
```

### Build the POC
```
cd src
npm install
npm run build
```

### Start FIWARE GEs

```
cd src
docker compose up -d
```

### Populate Context Broker with entities:
```
cd src/data
./generated_provision_{city}.sh # city you loaded the map
```

## Start playing

Open index.html and start playing...

![Screenshot](./img/screen1.jpeg)