# Poc_LLM_CB_FIWARE flowise example


## install chroma
follow chroma instructions: https://github.com/flowise/chroma
- open terminal
- clone or get chroma from github !
```
cd chroma
docker compose up -d --build
```
check chroma OK

## install flowise
use quickstart: https://docs.flowiseai.com/getting-started
enjoy, flowise GUI http://localhost:3000
- load `flowise/local qna ollama Chatflow.json` into flowise
- let's prepare embeddings (it can take almost 2 minutes, to index json file)
- then you can use chat
- embed link into index.html of the demo app
- change with <your chatflowid> in index.html, or take link from flowise UI
- open index.html in browser, chat button is at bootom right corner

compared to the use of openai embeddings, update of embeddings is done locally in chrom vector database, and used by flowise chatflow

