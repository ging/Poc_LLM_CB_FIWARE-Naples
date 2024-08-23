import './map.js';
import OpenAI from 'openai'

window.chatApp = window.chatApp || {};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function createThreadAssistant() {
  let monuments = await window.chatApp.getPoIs() // Get the PoIs from the map
  const thread = await openai.beta.threads.create({})

  //console.log('Thread has been created: ', thread)
  console.log(`Thread has been created with the all PoIs: ${monuments.length}`)
  //print the PoIs using a forEach loop and with the title and location and numbered
  monuments.forEach(function(entity, index) {
    console.log(`${index + 1}. ${entity.title} at ${entity.location.coordinates}`);
  });

  // this should change dinamically through the conversation
  // for instance, update this with a subscription to the CB: send a notification when a new NGSILD instructions entity is sent.
  const instructions = `You are an assistant for tourists in the city from where the data is provided. You only can answer me about the next point of interests that I will provide you in NGSI format. Por favor, solo limitate a los PoIs que te envio en cada consulta, sino solo responde que no encuentras nada.`

  const assistant = await openai.beta.assistants.create({
    instructions: instructions,
    model: 'gpt-4o',
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


  let new_instructions = `. Please, take only into consideration the following points of interest when giving advices: \
                          ${JSON.stringify(zoomedEntities)}.\
                          Otherwise, just say that you can't find anything.`;
  console.log('-> Sending message to thread: ', new_instructions);

  const message = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessage,
  })
  console.log('Adding message to thread: ', message)

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

  console.log('Answer: ', answer.text.value)

  return answer.text.value; // Return the response from the assistant
}
