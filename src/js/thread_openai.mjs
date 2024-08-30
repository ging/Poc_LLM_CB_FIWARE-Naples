import './map.mjs';
import OpenAI from 'openai'

window.chatApp = window.chatApp || {};

const model = "gpt-4o";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

// this should change dinamically through the conversation
// for instance, update this with a subscription to the CB: send a notification when a new NGSILD instructions entity is sent.
const instructions = "You are a tourist guide in the city from where the data is provided. " +
"Also you are expert in NGSI and semantics. You should only answer about the following points of interests that I will provide you in NGSI format. " +
"At first, you should only provide the name of the places with not extra detail, unless requested in the prompt message by the user. " +
"If you don't know about any place, or you cannot find anything matching the request you should just say that you can't find anything in a expresive and emphatic way related to the asked question.";


export async function createThreadAssistant() {
  let pois = await window.chatApp.getPoIs();
  let monuments = await pois.entities; // Get the PoIs from the map
  const thread = await openai.beta.threads.create({})

  //console.log('Thread has been created: ', thread)
  console.log(`Thread has been created with the all PoIs: ${monuments.length}`)


  const assistant = await openai.beta.assistants.create({
    instructions: instructions,
    model: model,
  })
  return [thread, assistant];
}

export async function sendMessage(threadId, assistantId, userMessage, additionalContext = []) {
  let end = 0;
  let duration = [];
  let durationOAI = [];
  let waiting = 0;

  // Start time measure for CB call
  console.time("Orion CB");
  const start = performance.now(); // see https://dev.to/saranshk/how-to-measure-javascript-execution-time-5h2
  let zoomedEntities = await window.chatApp.getPoIs();
  const endCB = performance.now();
  console.timeEnd("Orion CB");
  console.log("Duration CB: " + (endCB-start) + " ms");
  // End call to CB and time measure


  const extraInstructions = "You should provide the information in plain text, with natural language understandable by tourists. " +
  "Please, also consider only the following points of interest when giving advices. Otherwise, just say that you can't find anything. " +
  "Answer in plain natural text please, no markdown nor HTML. And simple items including only the title, unless requested by the user. " +
  "Please, If there are NO PoIs, DO NOT GIVE ANY HINT, just say you do not know. Here are the PoIs: "
  let new_instructions = extraInstructions + JSON.stringify(zoomedEntities.entities);

  const message = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessage,
  })
  //console.log('Adding message to thread: ', message)

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    instructions: new_instructions,
  })

  const checkRun = async () => {
    console.time("OpenAI");
    const startOpenAI = performance.now();
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const retrieveRun = await openai.beta.threads.runs.retrieve(
          threadId,
          run.id
        )
        console.log('Run status: ', retrieveRun.status)
        if (retrieveRun.status === 'completed') {
          end = performance.now();
          duration.push(end-start); // in milliseconds
          durationOAI.push(end-startOpenAI); // in milliseconds
          console.log("Duration total: " + duration + " ms");
          console.log("Duration only OpenAI call: " + durationOAI + " ms");
          console.timeEnd("OpenAI");
          console.log("Waiting: " + waiting);
          clearInterval(interval)
          clearInterval(interval)
          resolve(retrieveRun)
        }
        else {
          waiting += 1
        }
      }, 300)
    })
  }

  await checkRun()

  const messages = await openai.beta.threads.messages.list(threadId)

  const answer = (messages.data ?? []).find((m) => m?.role === 'assistant')
    ?.content?.[0]

  return {
    //_complete_message: messages,
    //_complete_answer: answer,
    model: model,
    coordinates: zoomedEntities.coord,
    zoomedEntities: zoomedEntities.entities.map(
      it => it.id
    ),
    limit: document.getElementById("limit").value,
    assistantInstructions: instructions,
    extraInstructions: extraInstructions,
    prompt: userMessage,
    response: answer.text.value,
    durationCB: endCB-start,
    durationOAI: durationOAI,
    duration: duration,
    waiting: waiting,
  }
  //return answer.text.value; // Return the response from the assistant
}
